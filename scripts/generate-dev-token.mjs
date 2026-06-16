// One-time local utility: mints an Apple Music *developer* token (a signed JWT)
// from your AuthKey .p8 file. You only need this to feed scripts/authorize.html
// so you can sign in once and obtain a long-lived Music User Token.
//
// This is NOT used at build time — the build mints its own dev token from the
// base64-encoded key in env (see src/_data/music.mjs).
//
// Usage:
//   1. Put APPLE_AUTHKEY_PATH, APPLE_TEAM_ID, APPLE_KEY_ID in .env
//      (APPLE_AUTHKEY_PATH = path to your AuthKey_XXXX.p8 file).
//   2. node scripts/generate-dev-token.mjs
//   3. Copy the printed token into scripts/authorize.html.

import "dotenv/config";
import { readFileSync } from "node:fs";
import jwt from "jsonwebtoken";

const { APPLE_AUTHKEY_PATH, APPLE_TEAM_ID, APPLE_KEY_ID } = process.env;

if (!APPLE_AUTHKEY_PATH || !APPLE_TEAM_ID || !APPLE_KEY_ID) {
  console.error(
    "Missing env. Required: APPLE_AUTHKEY_PATH, APPLE_TEAM_ID, APPLE_KEY_ID (set them in .env)."
  );
  process.exit(1);
}

const privateKey = readFileSync(APPLE_AUTHKEY_PATH, "utf8");

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: APPLE_TEAM_ID,
  header: { alg: "ES256", kid: APPLE_KEY_ID },
});

console.log(token);
