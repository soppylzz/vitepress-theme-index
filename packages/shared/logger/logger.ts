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
    return !!(error as IndexError)[INDEX_ERROR_SYMBOL];
  }

  custom(showStack: boolean = true) {
    i.error(this.scope, this.message);
    if (showStack && this?.stack) consola.error(formatErrStack(this.stack));
  }
}

type IndexLogger = Record<IndexLogLevel, (msg: string) => void>;

function createLogger(scoped: string): IndexLogger {
  const prefixedScoped = `index-${scoped}` as const;
  const logger: Omit<IndexLogger, "error"> = {} as any;
  (["info", "success", "warn", "debug"] as IndexLogLevel[]).forEach((level) => {
    logger[level] = (msg: string) => i[level](prefixedScoped, msg);
  });

  return {
    ...logger,
    error: (msg: string) => {
      throw new IndexError(msg, prefixedScoped);
    },
  };
}

const buildLogger = createLogger("build");
const pluginLogger = createLogger("plugin");
const i18nLogger = createLogger("i18n");

export { buildLogger, pluginLogger, i18nLogger, IndexError };
