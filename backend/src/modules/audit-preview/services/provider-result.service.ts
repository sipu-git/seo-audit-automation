export type ProviderResult =
  | { status: "live"; data: unknown }
  | { status: "not_configured"; reason: string }
  | { status: "unavailable"; reason: string };

export class ProviderNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderNotConfiguredError";
  }
}

export async function loadProvider(
  name: string,
  load: () => Promise<unknown>,
): Promise<ProviderResult> {
  try {
    return { status: "live", data: await load() };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The provider request failed.";
    const status = error instanceof ProviderNotConfiguredError ? "not_configured" : "unavailable";
    if (status === "unavailable") {
      console.warn(`${name} provider request failed: ${reason}`);
    }
    return { status, reason };
  }
}
