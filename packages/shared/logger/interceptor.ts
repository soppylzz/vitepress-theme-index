import { isBrowser, isNode } from "../utils";
import { pluginLogger, IndexError } from "./logger";

interface IndexErrorInterceptor {
  useCustom: boolean;
  showStack: boolean;
  silent: boolean;
}

function setupIndexErrorInterceptor(config?: Partial<IndexErrorInterceptor>) {
  const resolved: Required<IndexErrorInterceptor> = {
    useCustom: true,
    showStack: true,
    silent: false,
    ...config,
  };

  const errorHandler = (event: ErrorEvent | PromiseRejectionEvent | Error) => {
    const error = event instanceof Error ? event : "error" in event ? event.error : undefined;
    if (!error || resolved.silent) return;
    if (!resolved.useCustom || !IndexError.is(error)) return;
    (error as IndexError).custom(resolved.showStack);
  };

  let env: string;
  if (isBrowser()) {
    env = "browser";
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", errorHandler);
  } else if (isNode()) {
    env = "node";
    process.on("uncaughtException", errorHandler);
    process.on("unhandledrejection", errorHandler);
  } else {
    throw new IndexError("unable to setup error interceptor");
  }
  pluginLogger.info(`setup index error interceptor in ${env}`);
}

export type { IndexErrorInterceptor };
export { setupIndexErrorInterceptor };
