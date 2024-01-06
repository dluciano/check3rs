import { createLibp2p, type Libp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { dcutr } from "@libp2p/dcutr";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { multiaddr, type MultiaddrInput } from "@multiformats/multiaddr";
import { logger } from "./logger";
import * as lp from "it-length-prefixed";
import map from "it-map";
import { pipe } from "it-pipe";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString } from "uint8arrays/to-string";
import type { Duplex, Sink, Source } from "it-stream-types";
import { bootstrap } from "@libp2p/bootstrap";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { createSecp256k1PeerId } from "@libp2p/peer-id-factory";

export type LibP2PLogLevel = null | "all" | "network";

class P2PHandler {
  private readonly messagesReadStream: ReadableStream<string>;
  private debugAllLibP2P = () => localStorage.setItem("debug", "libp2p:*");
  private debugNetworkLibP2P = () =>
    localStorage.setItem(
      "debug",
      "libp2p:websockets,libp2p:webtransport,libp2p:kad-dht,libp2p:dialer"
    );
  private removeLibP2PDebugging = () => localStorage.removeItem("debug");
  private readonly messagesQueue: string[] = [];
  private isStarted = false;
  private node?: Libp2p;

  constructor() {
    let interval: NodeJS.Timeout;
    this.messagesReadStream = new ReadableStream({
      start: (controller) => {
        interval = setInterval(() => {
          if (!this.isStarted) return;
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
    const subscriptionName = `peer_${peerId.toString()}_in_lobby`;
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
            import.meta.env.PUBLIC_P2P_SERVER_ADDR,
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
    node.addEventListener("peer:discovery", (evt) => {
      logger.log(
        "peer:discovery > node.getPeers():" + JSON.stringify(node.getPeers())
      );
      logger.log(`peer:discover > event.detail ${JSON.stringify(evt.detail)}`);
    });

    node.addEventListener("peer:connect", (evt) => {
      logger.log(
        "peer:connect > node.getPeers():" + JSON.stringify(node.getPeers())
      );
      logger.log(`peer:connect > evt.detail" ${JSON.stringify(evt.detail)}`);
    });

    node.addEventListener("connection:close", (evt) => {
      logger.log(
        "connection:close > node.getPeers():" + JSON.stringify(node.getPeers())
      );
      logger.log("connection:close > evt.detail:" + JSON.stringify(evt.detail));
    });

    node.addEventListener("self:peer:update", () => {
      const multiaddrs = node.getMultiaddrs();
      logger.log("self:peer:update > evt.detail:" + JSON.stringify(multiaddrs));
    });

    node.handle("/chat/1.0.0", async ({ connection, stream }) => {
      await logger.log(`New chat with connection: ${connection.id}`);
      this.pipeReadWrite(stream, onNewMessage);
    });

    node.services.pubsub.addEventListener("message", async (event) => {
      const jsonMessage = toString(event.detail.data);

      const peerAddress = JSON.parse(jsonMessage) as string[];
      let canConnect = false;
      for (const strAddr of peerAddress) {
        const mAddress = multiaddr(strAddr);

        try {
          const stream = await node.dialProtocol(mAddress, "/chat/1.0.0");
          this.pipeReadWrite(stream, onNewMessage);
          canConnect = true;
        } catch (error) {
          console.error(error);
        }
      }
      if (!canConnect)
        throw new Error(`Cannot connect to peer addresses: ${peerAddress}`);

      onPeerConnected("");
      node.services.pubsub.unsubscribe(subscriptionName);

      await logger.log(
        "connectToPeer -> node.getPeers():" + JSON.stringify(node.getPeers())
      );
    });

    await node.start();

    const addr = multiaddr(import.meta.env.PUBLIC_P2P_SERVER_ADDR);
    await node.dial(addr);
    node.services.pubsub.subscribe(subscriptionName);
    this.isStarted = true;
    await logger.log(
      "connectToSignallingServer finished" + JSON.stringify(node.getPeers())
    );
  }

  stop = async () => {
    await this.node?.stop();
  };

  sendMessage = async (message: string) => {
    this.messagesQueue.push(message);
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
      (source) => map(source, (string) => uint8ArrayFromString(string)),
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
