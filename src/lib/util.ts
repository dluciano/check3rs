export const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    const i = setTimeout(() => {
      resolve();
      clearTimeout(i);
    }, ms);
  });
