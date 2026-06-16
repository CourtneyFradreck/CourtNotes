// Build-time Apple Music "recently played" data for the About page.
//
// Authored as ESM (.mjs) because this is an Eleventy v3 project that is
// otherwise CommonJS (no "type": "module"); the .mjs extension forces ESM
// without touching the rest of the build.
//
// Hard rule: a missing token or a failed API call must NEVER break the build.
// Every failure path returns [] so the About page simply renders no tracks.
//
// A fresh developer (JWT) token is minted on every build from the base64'd .p8
// in env. The Music User Token is long-lived (~6 months) and rotated manually.

import jwt from "jsonwebtoken";

const RECENT_TRACKS_URL =
  "https://api.music.apple.com/v1/me/recent/played/tracks?limit=5";

export default async function () {
  // Local dev convenience: load .env so `npm run start` / `npm run build` can
  // populate these vars. Guarded with try/catch — on Netlify the env is already
  // set (and dotenv is a devDependency that may be pruned), so a missing dotenv
  // here must never break the build.
  try {
    await import("dotenv/config");
  } catch {}

  const {
    APPLE_AUTHKEY_BASE64,
    APPLE_TEAM_ID,
    APPLE_KEY_ID,
    APPLE_MUSIC_USER_TOKEN,
  } = process.env;

  // Local dev / unconfigured builds: render nothing rather than failing.
  if (
    !APPLE_AUTHKEY_BASE64 ||
    !APPLE_TEAM_ID ||
    !APPLE_KEY_ID ||
    !APPLE_MUSIC_USER_TOKEN
  ) {
    return [];
  }

  try {
    const privateKey = Buffer.from(APPLE_AUTHKEY_BASE64, "base64").toString(
      "utf8"
    );

    const devToken = jwt.sign({}, privateKey, {
      algorithm: "ES256",
      expiresIn: "180d",
      issuer: APPLE_TEAM_ID,
      header: { alg: "ES256", kid: APPLE_KEY_ID },
    });

    const res = await fetch(RECENT_TRACKS_URL, {
      headers: {
        Authorization: `Bearer ${devToken}`,
        "Music-User-Token": APPLE_MUSIC_USER_TOKEN,
      },
    });

    if (!res.ok) {
      console.warn(
        `[music] Apple Music API responded ${res.status} ${res.statusText}; rendering no tracks.`
      );
      return [];
    }

    const json = await res.json();
    const tracks = Array.isArray(json.data) ? json.data : [];

    return tracks.map((track) => {
      const attributes = track.attributes || {};
      const artworkUrl = (attributes.artwork && attributes.artwork.url) || "";
      return {
        name: attributes.name || "",
        artist: attributes.artistName || "",
        url: attributes.url || "",
        // Apple returns a templated URL with {w}/{h} placeholders.
        artwork: artworkUrl.replace("{w}", "300").replace("{h}", "300"),
      };
    });
  } catch (err) {
    console.warn(
      `[music] Failed to fetch Apple Music recently played: ${err.message}`
    );
    return [];
  }
}
