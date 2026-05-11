import type {
  RMenuItemRecord,
  ResolvedIndexRightMenuConfig,
  UserIndexRightMenuConfig,
} from "../../types";
import type { WithDefaultMenuRecord } from "./default";
import { defaultMenuConfig, defaultMenuItemRecord } from "./default";
import { merge } from "lodash-unified";

function resolveIndexMenuConfig<Records extends RMenuItemRecord>(
  config: UserIndexRightMenuConfig<Records>
): ResolvedIndexRightMenuConfig<Records | WithDefaultMenuRecord<Records>> {
  const merged = merge(defaultMenuConfig, config);

  return Object.assign(merged, {
    record: config?.record ?? (merged.preset ? defaultMenuItemRecord : {}),
  });
}

export { resolveIndexMenuConfig };
