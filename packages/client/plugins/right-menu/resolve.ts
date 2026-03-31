import type {
  RMenuItemRecord,
  ResolvedIndexRightMenuConfig,
  UserIndexRightMenuConfig,
  WithDefaultMenuRecord,
} from "../../types";
import { defaultMenuConfig, defaultMenuItemRecord } from "../../types";
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
