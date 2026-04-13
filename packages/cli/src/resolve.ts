import { outro } from "@clack/prompts";
import { cliLogger } from "@vitepress-theme-index/shared";
import type { CliModule, HookContext, IndexCliOptions } from "./type";
import { outputMetadata, installDependencies } from "./utils";
import { createMarkdown, createPackage, createScripts } from "./modules";
import { isArray } from "lodash-unified";

async function scaffold(options: IndexCliOptions) {
  const ctx: HookContext = { options, metadata: {} };
  const manager: CliModule[] = [createPackage(), createMarkdown(), createScripts()];

  try {
    const validateErrors: typeof ctx.metadata.validateErrors = [];

    for (const [index, module] of manager.entries()) {
      if (module.validate) {
        const result = await module.validate(ctx);
        if (result === true) continue;

        const [code, msg] = isArray(result) ? result : ["UNKNOWN", `validation failed in ${index}th module.`];
        validateErrors.push({ name: module.name, code, msg });
      }
    }

    if (validateErrors && validateErrors.length > 0) {
      outro("validation failed!");
      ctx.metadata.validationFailed = true;
      ctx.metadata.validateErrors = validateErrors;
      await outputMetadata(ctx);

    } else {
      outro("scaffolding completed!");
      for (const mod of manager) {
        if (mod?.create) await mod.create(ctx);
      }
      for (const mod of manager) {
        if (mod?.postCreate) await mod.postCreate(ctx);
      }
      await outputMetadata(ctx);
      await installDependencies(options);
    }
  } catch (err) {
    cliLogger.error(err);
    throw err;
  }
}

export { scaffold };
