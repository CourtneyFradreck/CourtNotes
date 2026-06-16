// TEMP diagnostic — validates the Apple Music developer token and (if present)
// the Music User Token. Safe to delete.
import "dotenv/config";
import jwt from "jsonwebtoken";

const {
  APPLE_AUTHKEY_BASE64,
  APPLE_TEAM_ID,
  APPLE_KEY_ID,
  APPLE_MUSIC_USER_TOKEN,
} = process.env;

console.log("env present:", {
  APPLE_AUTHKEY_BASE64: !!APPLE_AUTHKEY_BASE64,
  APPLE_TEAM_ID: !!APPLE_TEAM_ID,
  APPLE_KEY_ID: !!APPLE_KEY_ID,
  APPLE_MUSIC_USER_TOKEN: !!APPLE_MUSIC_USER_TOKEN,
});

if (!APPLE_AUTHKEY_BASE64 || !APPLE_TEAM_ID || !APPLE_KEY_ID) {
  console.error("Missing dev-token env; cannot continue.");
  process.exit(0);
}

const privateKey = Buffer.from(APPLE_AUTHKEY_BASE64, "base64").toString("utf8");
console.log("decoded key starts with:", privateKey.slice(0, 27));

const devToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: APPLE_TEAM_ID,
  header: { alg: "ES256", kid: APPLE_KEY_ID },
});
console.log("dev token minted, length:", devToken.length);

// 1) Developer-token-only call (no user token needed) — validates key/team/kid.
const catalogRes = await fetch(
  "https://api.music.apple.com/v1/catalog/us/charts?types=songs&limit=1",
  { headers: { Authorization: `Bearer ${devToken}` } }
);
console.log("\n[catalog] status:", catalogRes.status, catalogRes.statusText);
if (!catalogRes.ok) {
  console.log("[catalog] body:", (await catalogRes.text()).slice(0, 500));
} else {
  console.log("[catalog] ✅ developer token is VALID");
}

// 2) Recently played (needs the Music User Token).
if (APPLE_MUSIC_USER_TOKEN) {
  const recentRes = await fetch(
    "https://api.music.apple.com/v1/me/recent/played/tracks?limit=5",
    {
      headers: {
        Authorization: `Bearer ${devToken}`,
        "Music-User-Token": APPLE_MUSIC_USER_TOKEN,
      },
    }
  );
  console.log("\n[recent] status:", recentRes.status, recentRes.statusText);
  const body = await recentRes.text();
  console.log("[recent] body (first 800 chars):", body.slice(0, 800));
} else {
  console.log("\n[recent] SKIPPED — APPLE_MUSIC_USER_TOKEN not set in .env");
}
