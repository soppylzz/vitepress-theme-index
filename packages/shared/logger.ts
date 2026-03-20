import consola from "consola";
import chalk from "chalk";

interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string | Error): void;
  debug(message: string): void;
}

function createLogger(scope: string): Logger {
  const formatTag = chalk.blue.bold(`[${scope}]`);

  return {
    info: (msg: string) => consola.info(`${formatTag} ${chalk.cyan(msg)}`),
    success: (msg: string) => consola.success(`${formatTag} ${chalk.green(msg)}`),
    warn: (msg: string) => consola.warn(`${formatTag} ${chalk.yellow(msg)}`),
    error: (msg: string) => consola.error(`${formatTag} ${chalk.red(msg)}`),
    debug: (msg: string) => consola.log(`${formatTag} ${chalk.magenta(msg)}`),
  };
}
const buildLogger = createLogger("index-build");
const pluginLogger = createLogger("index-plugin");
const i18nLogger = createLogger("index-i18n");

export type { Logger };
export { pluginLogger, buildLogger, i18nLogger };
