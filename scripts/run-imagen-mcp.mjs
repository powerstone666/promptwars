import fs from "node:fs";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const envPath = "/Users/imran/Downloads/Upskilling/typescript/Image-mcp/.env";
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex < 1) continue;

  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed
    .slice(eqIndex + 1)
    .trim()
    .replace(/^['"]|['"]$/g, "");

  process.env[key] = value;
}

const client = new Client(
  { name: "codex-image-client", version: "1.0.0" },
  { capabilities: {} },
);

const transport = new StdioClientTransport({
  command: "node",
  args: ["/Users/imran/Downloads/Upskilling/typescript/Image-mcp/dist/server.js"],
  env: process.env,
  stderr: "inherit",
});

await client.connect(transport);

const result = await client.callTool({
  name: "generate_image",
  arguments: {
    name: "promptwar-hero",
    prompt:
      "Editorial anime poster illustration for a hackathon AI operating system landing page, dynamic heroic coder character, cinematic comic-book framing, warm cream paper background, coral yellow cyan accents, clean cel shaded rendering, expressive pose, premium product art, no text, portrait composition",
    outDir: "/Users/imran/Downloads/Upskilling/typescript/promptwar/main/public",
  },
});

console.log(JSON.stringify(result));
await client.close();
