import type { IndexLogLevel, IndexScoped } from "./type";
import consola from "consola";
import chalk from "chalk";

const INDEX_ERROR_SYMBOL = Symbol("index-error");
const colors: Record<IndexLogLevel, (msg: string) => string> = {
  info: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  debug: chalk.magenta,
  error: chalk.red,
};

const format = (scoped: IndexScoped, msg: string, level: IndexLogLevel) =>
  `${chalk.blue.bold(`[${scoped}]`)}: ${colors[level](msg)}`;
const i: Record<IndexLogLevel, (scoped: IndexScoped, msg: string) => void> = {
  info: (scoped, msg) => consola.info(format(scoped, msg, "info")),
  success: (scoped, msg) => consola.success(format(scoped, msg, "success")),
  warn: (scoped, msg) => consola.warn(format(scoped, msg, "warn")),
  debug: (scoped, msg) => consola.debug(format(scoped, msg, "debug")),
  error: (scoped, msg) => consola.error(format(scoped, msg, "error")),
};

function formatErrStack(stack: string) {
  return stack
    .split("\n")
    .slice(1)
    .map((line) => chalk.gray.italic(line))
    .join("\n");
}

class IndexError extends Error {
  public readonly [INDEX_ERROR_SYMBOL] = true;
  public readonly scope: IndexScoped;

  constructor(message: string, scope?: IndexScoped) {
    super(message);
    this.name = "IndexError";
    this.scope = scope || "index-error";
    Object.setPrototypeOf(this, IndexError.prototype);
  }

  static is(error: unknown): error is IndexError {
    return error instanceof IndexError || !!(error as IndexError)[INDEX_ERROR_SYMBOL];
  }

  custom(showStack: boolean = true) {
    i.error(this.scope, this.message);
    if (showStack && this?.stack) consola.error(formatErrStack(this.stack));
  }
}

type IndexNormLogLevel = Exclude<IndexLogLevel, "error">;
function createLogger(scoped: string) {
  const prefixedScoped = `index-${scoped}` as const;
  const logger: Record<IndexNormLogLevel, (msg: string) => void> = {} as any;

  (["info", "success", "warn", "debug"] as IndexNormLogLevel[]).forEach((level) => {
    logger[level] = (msg: string) => i[level](prefixedScoped, msg);
  });

  return {
    ...logger,
    error: (msg: Error | string): never => {
      const message = msg instanceof Error ? msg.message : msg;
      throw new IndexError(message, prefixedScoped);
    },
  };
}

const buildLogger = createLogger("build");
const pluginLogger = createLogger("plugin");
const injectLogger = createLogger("inject");
const rightMenuLogger = createLogger("right-menu");
const renderLogger = createLogger("render");
const runtimeLogger = createLogger("runtime");
const cliLogger = createLogger("cli");
const searchLogger = createLogger("search");

export {
  buildLogger,
  pluginLogger,
  injectLogger,
  rightMenuLogger,
  renderLogger,
  runtimeLogger,
  cliLogger,
  searchLogger,
  IndexError,
};
