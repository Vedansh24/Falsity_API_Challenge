const isDev = process.env.NODE_ENV === 'development';

function safeArgs(args: unknown[]): unknown[] {
  return args.map((a) => (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean' ? a : '[omitted]'));
}

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...safeArgs(args));
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...safeArgs(args));
    }
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...safeArgs(args));
  }
};
