import { type Config, configSchema } from "./schema.ts";
import { join } from "@std/path";

const CONFIG_NAME = "quadlet-forge";

export async function loadConfig(): Promise<Config> {
  try {
    // Resolve the path relative to the user's working directory

    const configPath = join(Deno.cwd(), "quadlet-forge.config.ts");
    const configModule = await import(configPath);
    if (!configModule || !configModule.default) {
      throw new Error(`No default export found in ${CONFIG_NAME}.config.ts`);
    }
    const config = configSchema.safeParse(configModule.default);

    if (!config.success) {
      throw new Error(
        `Invalid '${CONFIG_NAME}.config.ts'. Please fix all typescript errors and ensure that the configuration object matches the schema.`
      );
    }

    return config.data;
  } catch (err) {
    throw new Error(
      `Could not load configuration. Please ensure that a ${CONFIG_NAME}.config.ts file exists in your project root and exports a default configuration object. ${
        err instanceof Error ? err.message : ""
      }`
    );
  }
}
