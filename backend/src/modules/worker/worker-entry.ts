import "dotenv/config";
import { startAuditWorker } from "./audit-worker.js";

async function main() {
  const shutdownWorker = startAuditWorker();
  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`Received ${signal}; shutting down the audit worker.`);

    try {
      await shutdownWorker();
    } catch (error) {
      console.error("Unable to shut down the audit worker cleanly:", error);
      process.exitCode = 1;
    }
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("Audit worker failed to start:", error);
  process.exitCode = 1;
});
