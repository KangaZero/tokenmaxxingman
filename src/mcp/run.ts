import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';

/**
 * Start the MCP server on stdio and register signal handlers.
 *
 * CRITICAL: stdout belongs to the JSON-RPC transport. Every diagnostic goes to
 * stderr — a stray `console.log` corrupts the protocol stream and the client
 * drops the connection with a parse error.
 *
 * WHY this lives apart from `bin.ts`: `bin.ts` is the shebang entry point and
 * invokes this on import. If the CLI's `mcp` subcommand imported `bin.ts`, that
 * import alone would start one server and the explicit call would start a
 * second — two servers writing to one stdout, so every request got two
 * responses. Keeping the side effect in `bin.ts` and the callable here means
 * exactly one server exists per process, whichever entry point is used.
 */
/** How long a graceful close may take before the process is forced down. */
const SHUTDOWN_TIMEOUT_MS = 5_000;

export async function runStdioServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('tokenmaxxingman MCP server listening on stdio\n');

  // Registering these handlers suppresses Node's default termination, so this
  // code is now solely responsible for the process ever exiting.
  //
  // Three things the previous version got wrong:
  //   - `close().finally(() => process.exit(0))` reported a FAILED close as a
  //     clean exit, and swallowed the rejection because the process died first.
  //   - a hung `close()` made the process unkillable by signal.
  //   - a second Ctrl-C during shutdown re-entered the handler.
  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      // The operator asked twice. Stop arguing and go.
      process.exit(130);
    }
    shuttingDown = true;
    process.stderr.write(`tokenmaxxingman MCP server received ${signal}, closing\n`);

    const deadline = setTimeout(() => {
      process.stderr.write('tokenmaxxingman MCP server close timed out, forcing exit\n');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    // Do not let the timer itself hold the event loop open.
    deadline.unref();

    void (async (): Promise<void> => {
      try {
        await server.close();
        clearTimeout(deadline);
        process.exit(0);
      } catch (err) {
        clearTimeout(deadline);
        process.stderr.write(
          `tokenmaxxingman MCP server failed to close cleanly: ${
            err instanceof Error ? err.message : String(err)
          }\n`,
        );
        process.exit(1);
      }
    })();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
