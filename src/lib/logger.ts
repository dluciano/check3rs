type Logger = {
  log: (message: string) => Promise<void>;
  warn: (message: string) => Promise<void>;
  error: (error: Error | unknown) => Promise<void>;
};

export const logger: Logger = {
  log: async (message) => {
    console.log(message);
  },
  warn: async (message) => {
    console.warn(message);
  },
  error: async (error) => {
    console.error(error);
  },
};

export const withLog = async (
  func: (logger: Logger) => Promise<any>,
  shouldThrow: boolean = false
) => {
  try {
    return await func(logger);
  } catch (error) {
    console.error(error);
    if (shouldThrow) throw error;
  }
};
