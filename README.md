# Anyrow MCP Server

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@anyrow/mcp-server)](https://www.npmjs.com/package/@anyrow/mcp-server)

Model Context Protocol server for the [Anyrow](https://anyrow.ai) API. Gives Claude, Cursor, Windsurf, and any MCP-compatible LLM direct, typed access to Anyrow document extraction and table operations.

## Install

### Claude Code

```bash
claude mcp add anyrow 'npx -y @anyrow/mcp-server' -e ANYROW_API_KEY=sk_your_api_key
```

### Cursor / Claude Desktop / Windsurf

Add to your MCP config JSON:

```json
{
  "mcpServers": {
    "anyrow": {
      "command": "npx",
      "args": ["-y", "@anyrow/mcp-server"],
      "env": {
        "ANYROW_API_KEY": "sk_your_api_key"
      }
    }
  }
}
```

## Environment

| Variable          | Required | Description                                              |
| ----------------- | -------- | -------------------------------------------------------- |
| `ANYROW_API_KEY`  | yes      | Bearer token sent on every tool call.                    |
| `ANYROW_BASE_URL` | no       | Override API base URL. Defaults to `https://api.anyrow.com`. |

Get your API key at [anyrow.ai/dashboard](https://anyrow.ai/dashboard).

## Available tools

- `anyrow_extract` — extract structured data from a document (URL, file, or text).
- `anyrow_suggest_schema` — suggest a table schema from sample content.
- `anyrow_table_list` — list tables in a project.
- `anyrow_table_get` — fetch a table by id.
- `anyrow_row_list` — list rows with filters, sort, pagination.
- `anyrow_row_get` — fetch a single row.

Tool names prefix with `anyrow_` to stay unique across multi-MCP installs. Streaming endpoints (SSE) and destructive admin operations are excluded.

## How it works

Thin wrapper around [`@anyrow/sdk-typescript`](https://github.com/anyrow/sdk-typescript). MCP client spawns `anyrow-mcp` as a subprocess, stdio JSON-RPC handshake (`initialize` → `tools/list` → `tools/call`), SDK handles HTTP, results come back as JSON content blocks.

Generated from the Anyrow [OpenAPI spec](https://github.com/anyrow/openapi). Every tool is typed end to end — inputs validated against the spec's JSON Schema, outputs forwarded verbatim to the LLM.

## Resources

- [Anyrow API docs](https://docs.anyrow.ai)
- [OpenAPI spec](https://github.com/anyrow/openapi)
- [TypeScript SDK](https://github.com/anyrow/sdk-typescript)
- [Python SDK](https://github.com/anyrow/sdk-python)
- [Go SDK](https://github.com/anyrow/sdk-go)
- [Rust SDK](https://github.com/anyrow/sdk-rust)
- [CLI](https://github.com/anyrow/cli)
- [MCP spec](https://modelcontextprotocol.io)

## License

MIT — see [LICENSE](./LICENSE).
