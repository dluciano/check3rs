import { createLibp2p, type Libp2p } from "libp2p";
import { fromString } from "uint8arrays/from-string";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { dcutr } from "@libp2p/dcutr";
import { identify, type Identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { logger } from "./logger";
import { toString } from "uint8arrays/to-string";
import { bootstrap } from "@libp2p/bootstrap";
import { gossipsub, type GossipsubEvents } from "@chainsafe/libp2p-gossipsub";
import { createSecp256k1PeerId } from "@libp2p/peer-id-factory";
import * as filters from "@libp2p/websockets/filters";
import type { Duplex, Source } from "it-stream-types";
import * as lp from "it-length-prefixed";
import map from "it-map";
import { pipe } from "it-pipe";

interface ITGameRoomMessage {
  type: string;
}

export type LibP2PLogLevel = null | "all" | "network";

class P2PHandler {
  private debugAllLibP2P = () => localStorage.setItem("debug", "libp2p:*");
  private debugNetworkLibP2P = () =>
    localStorage.setItem(
      "debug",
      "libp2p:websockets,libp2p:webtransport,libp2p:kad-dht,libp2p:dialer"
    );
  public connectionStatus: "idle" | "connecting" | "connected" = "idle";
  private removeLibP2PDebugging = () => localStorage.removeItem("debug");
  private gameRoomTopic = "";
  private node?: Libp2p<{
    identify: Identify;
    pubsub: any;
    dcutr: unknown;
  }>;
  private readonly messagesReadStream: ReadableStream<string>;
  private readonly messagesQueue: string[] = [];

  constructor() {
    let interval: NodeJS.Timeout;
    this.messagesReadStream = new ReadableStream({
      start: (controller) => {
        interval = setInterval(() => {
          if (!this.connectionStatus) return;
          if (this.node?.getPeers().length === 0) return;
          if (this.messagesQueue.length > 0)
            controller.enqueue(this.messagesQueue.pop());
        }, 250);
      },
      cancel: () => clearInterval(interval),
    });
  }
  updateLibP2PDebugging = (
    libP2PLogType: LibP2PLogLevel,
    removeDebug: boolean
  ) => {
    if (libP2PLogType === "all") this.debugAllLibP2P();
    else if (libP2PLogType === "network") this.debugNetworkLibP2P();
    else this.removeLibP2PDebugging();
    if (removeDebug) this.removeLibP2PDebugging();
  };

  async start(
    peerId: Awaited<ReturnType<typeof createSecp256k1PeerId>>,
    onNewMessage: (message: string) => Promise<void>,
    onPeerConnected: (otherPeerAddress: string) => Promise<void>
  ) {
    if (
      this.node &&
      (this.node.status === "started" ||
        this.node.status === "starting" ||
        this.node.status === "stopping")
    ) {
      console.warn("cannot start connection when ");
      return;
    }
    const signalingServer = import.meta.env.PUBLIC_P2P_SERVER_ADDR;
    const node = await createLibp2p({
      peerId,
      start: false,
      addresses: {
        listen: [
          // create listeners for incoming WebRTC connection attempts on on all
          // available Circuit Relay connections
          "/webrtc",
        ],
      },
      transports: [
        // the WebSocket transport lets us dial a local relay
        webSockets({
          // this allows non-secure WebSocket connections for purposes of the demo
          filter: filters.all,
        }),
        // support dialing/listening on WebRTC addresses
        webRTC(),
        // support dialing/listening on Circuit Relay addresses
        circuitRelayTransport({
          // make a reservation on any discovered relays - this will let other
          // peers use the relay to contact us
          discoverRelays: 1,
        }),
      ],
      // a connection encrypter is necessary to dial the relay
      connectionEncryption: [noise()],
      // a stream muxer is necessary to dial the relay
      streamMuxers: [yamux(), mplex()],
      connectionGater: {
        denyDialMultiaddr: () => {
          // by default we refuse to dial local addresses from browsers since they
          // are usually sent by remote peers broadcasting undialable multiaddrs and
          // cause errors to appear in the console but in this example we are
          // explicitly connecting to a local node so allow all addresses
          return false;
        },
      },
      services: {
        identify: identify(),
        pubsub: gossipsub(),
        dcutr: dcutr(),
      },
      connectionManager: {
        minConnections: 0,
      },
      peerDiscovery: [
        bootstrap({
          list: [
            // a list of bootstrap peer multiaddrs to connect to on node startup
            signalingServer,
            // "/ip4/127.0.0.1/tcp/19907/ws/p2p/Qma3GsJmB47xYuyahPZPSadh1avvxfyYQwk8R3UnFrQ6aP",
            // "/dns4/p2p.uksouth.cloudapp.azure.com/tcp/443/wss/p2p/Qma3GsJmB47xYuyahPZPSadh1avvxfyYQwk8R3UnFrQ6aP",
          ],
          timeout: 1000, // in ms,
          tagName: "bootstrap",
          tagValue: 50,
          tagTTL: 120000, // in ms
        }),
      ],
    });
    this.node = node;

    await node.handle("/chat/1.0.0", async ({ connection, stream }) => {
      await logger.log(`New chat with connection: ${connection.id}`);
      this.pipeReadWrite(stream, onNewMessage);
    });

    node.services.pubsub.addEventListener("message", async (event) => {
      // TODO: sanitize input
      const jsonMessage = JSON.parse(toString(event.detail.data));
      const topic = event.detail.topic;
      if (topic === this.gameRoomTopic) {
        await onNewMessage(jsonMessage);
        return;
      }
      if (topic !== `gameroom_connection_changes_${node.peerId.toString()}`)
        throw new Error(`Unknown topic: ${event.detail.topic}`);

      if (
        this.connectionStatus === "connecting" ||
        this.connectionStatus === "connected"
      )
        return;

      node.services.pubsub.unsubscribe(
        `gameroom_connection_changes_${node.peerId.toString()}`
      );
      node.services.pubsub.unsubscribe(`gameroom_${node.peerId.toString()}`);

      this.connectionStatus = "connecting";
      const hostAddresses = jsonMessage as string[];

      for (const address of hostAddresses) {
        const multAddr = multiaddr(address);
        const hostPeerId = multAddr.getPeerId();
        if (!hostPeerId)
          throw new Error(`${hostPeerId}, host peer id is not defined`);
        if (hostPeerId.toString() === node.peerId.toString()) {
          console.warn(`Tried to set host connection to itself`);
          return;
        }

        //TODO: avoid reconnecting?
        try {
          const stream = await node.dialProtocol(multAddr, "/chat/1.0.0");
          this.pipeReadWrite(stream, onNewMessage);
          console.log("Connected to chat protocol");
          this.connectionStatus = "connected";
          onPeerConnected(hostPeerId);
          return;
        } catch (error) {
          console.warn(error);
        }

        try {
          const connection = await node.dial(multAddr);
          if (!hostPeerId)
            throw new Error(`host address: ${address} has not peer id`);
          const gameRoomTopic = `gameroom_${hostPeerId}`;
          node.services.pubsub.subscribe(gameRoomTopic);

          // node is not the host, you can safely unsubscribe from gameroom
          node.services.pubsub.unsubscribe(
            `gameroom_${node.peerId.toString()}`
          );
          this.gameRoomTopic = gameRoomTopic;
          onPeerConnected(hostPeerId);
          this.connectionStatus = "connected";
          return;
        } catch (error) {
          logger.warn(`Cannot connect to host address: ${address}. ${error}`);
        }
        this.connectionStatus = "idle";
        throw new Error(`Cannot connect to peer addresses: ${hostAddresses}`);
      }
    });

    await node.start();

    const addr = multiaddr(signalingServer);
    await node.dial(addr);

    node.services.pubsub.subscribe(
      `gameroom_connection_changes_${node.peerId.toString()}`
    );
    node.services.pubsub.subscribe(`gameroom_${node.peerId.toString()}`);
  }

  stop = async () => {
    await this.node?.stop();
  };

  sendMessage = async <TMessage extends ITGameRoomMessage>(
    message: TMessage
  ) => {
    const node = this.node;
    if (!node) {
      await logger.warn("Cannot send message because node is not defined");
      return;
    }
    const msg = { value: message, type: message.type };
    const msgJson = JSON.stringify(msg);
    if (!this.gameRoomTopic || this.gameRoomTopic === "") {
      this.messagesQueue.push(msgJson);
      return;
    }
    await node.services.pubsub.publish(
      this.gameRoomTopic,
      fromString(JSON.stringify(msgJson))
    );
  };

  private pipeReadWrite(
    stream: Duplex<
      AsyncGenerator<any>,
      Source<any | Uint8Array>,
      Promise<void>
    >,
    onNewMessage: (message: string) => Promise<void>
  ) {
    const reader = this.messagesReadStream.getReader();
    pipe(
      async function* () {
        while (true) {
          const result = await reader.read();
          if (result.done) break;

          yield result.value;
        }
        reader.releaseLock();
        await reader.closed;
      },
      (source) => map(source, (string) => fromString(string)),
      (source) => lp.encode(source),
      stream.sink
    );

    pipe(
      stream,
      (source) => lp.decode(source),
      (source) => map(source, (buf) => toString(buf.subarray())),
      async function (source) {
        for await (const message of source) {
          await logger.log(`Message received: ${message}`);
          await onNewMessage(message);
        }
      }
    );
  }
}

const p2pHandler = new P2PHandler();

export default p2pHandler;
