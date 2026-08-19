#!/usr/bin/env node
import { runStdioServer } from './run.js';

// Side-effecting entry point. Nothing may import this module — importing it
// starts a server. Import `./run.js` instead.
runStdioServer().catch((err: unknown) => {
  process.stderr.write(
    `tokenmaxxingman MCP server failed to start: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
  );
  process.exit(1);
});
