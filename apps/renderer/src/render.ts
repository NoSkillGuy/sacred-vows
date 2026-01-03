#!/usr/bin/env node

/**
 * CLI tool for rendering invitations to static HTML
 * Compatible with Go backend's exec.Command interface
 *
 * Usage: node render.js --mode=bundle
 * Input: JSON via stdin
 * Output: JSON via stdout
 */

import { render } from "./entry-server";

import type { InvitationData } from "@shared/types/wedding-data";

interface Payload {
  invitation?: InvitationData;
  translations?: Record<string, unknown>;
}

async function main(): Promise<void> {
  const modeArg = process.argv.find((a) => a.startsWith("--mode="));
  const mode = modeArg ? modeArg.split("=")[1] : "html";

  // Read from stdin
  const input = await readStdin();
  if (!input) {
    throw new Error("No input provided");
  }

  const payload: Payload = JSON.parse(input);
  const invitation = payload.invitation || ({} as InvitationData);
  const translations = payload.translations || {};

  // Render
  const result = await render({
    invitation,
    translations,
  });

  if (mode === "bundle") {
    // Output full bundle as JSON
    process.stdout.write(JSON.stringify(result));
  } else {
    // Output just HTML
    process.stdout.write(result.html);
  }
}

function readStdin(maxSize: number = 10 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    let totalSize = 0;
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      totalSize += Buffer.byteLength(chunk, "utf8");
      if (totalSize > maxSize) {
        reject(new Error(`Input exceeds maximum size of ${maxSize} bytes`));
        return;
      }
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

main().catch((err) => {
  const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
  process.stderr.write(errorMessage + "\n");
  process.exit(1);
});
