// Build-time Apple Music data for the About page.
//
// Provides two things, each rendered as a playlist:
//   • recent        — my recently played tracks
//   • heavyRotation — Apple Music's auto-generated "Heavy Rotation" playlist
//                     (discovered at build time from my personalized
//                     recommendations, so it keeps working if Apple rotates
//                     the playlist id)
//
// Authored as ESM (.mjs) because this is an Eleventy v3 project that is
// otherwise CommonJS (no "type": "module"); the .mjs extension forces ESM
// without touching the rest of the build.
//
// Hard rule: a missing token or a failed API call must NEVER break the build.
// Every failure path degrades to empty data so the About page simply renders
// the affected playlist's fallback note. The function never throws.
//
// A fresh developer (JWT) token is minted on every build from the base64'd .p8
// in env. The Music User Token is long-lived (~6 months) and rotated manually.

import jwt from "jsonwebtoken";

const API = "https://api.music.apple.com/v1";
const RECENT_LIMIT = 8;
const HEAVY_ROTATION_LIMIT = 8;

const EMPTY = { recent: [], heavyRotation: null };

// Apple returns artwork URLs with {w}/{h} placeholders.
function formatArtwork(url, size) {
  return (url || "").replace("{w}", String(size)).replace("{h}", String(size));
}

function toTrack(item) {
  const a = item.attributes || {};
  return {
    name: a.name || "",
    artist: a.artistName || "",
    url: a.url || "",
    artwork: formatArtwork(a.artwork && a.artwork.url, 160),
  };
}

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
    return EMPTY;
  }

  let headers;
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
    headers = {
      Authorization: `Bearer ${devToken}`,
      "Music-User-Token": APPLE_MUSIC_USER_TOKEN,
    };
  } catch (err) {
    console.warn(`[music] Failed to mint developer token: ${err.message}`);
    return EMPTY;
  }

  // GET helper: returns parsed JSON, or null on any non-OK / network failure.
  async function getJson(url, label) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.warn(
          `[music] ${label} responded ${res.status} ${res.statusText}.`
        );
        return null;
      }
      return await res.json();
    } catch (err) {
      console.warn(`[music] ${label} failed: ${err.message}`);
      return null;
    }
  }

  // Run both lookups independently so one failing never empties the other.
  const [recent, heavyRotation] = await Promise.all([
    fetchRecent(getJson),
    fetchHeavyRotation(getJson),
  ]);

  return { recent, heavyRotation };
}

async function fetchRecent(getJson) {
  const json = await getJson(
    `${API}/me/recent/played/tracks?limit=${RECENT_LIMIT}`,
    "recently played"
  );
  const data = json && Array.isArray(json.data) ? json.data : [];
  return data.map(toTrack);
}

async function fetchHeavyRotation(getJson) {
  // "Heavy Rotation" isn't a library playlist — it's a personalized playlist
  // surfaced under "Playlists Made for You". Discover it from recommendations
  // so a rotated playlist id keeps resolving.
  const recs = await getJson(
    `${API}/me/recommendations?limit=20`,
    "recommendations"
  );
  if (!recs || !Array.isArray(recs.data)) return null;

  let playlist = null;
  for (const reco of recs.data) {
    const contents = (reco.relationships && reco.relationships.contents &&
      reco.relationships.contents.data) || [];
    for (const c of contents) {
      if (c.type === "playlists" && /heavy rotation/i.test(
        (c.attributes && c.attributes.name) || ""
      )) {
        playlist = c;
        break;
      }
    }
    if (playlist) break;
  }
  if (!playlist) {
    console.warn("[music] Heavy Rotation playlist not found in recommendations.");
    return null;
  }

  const attrs = playlist.attributes || {};
  // Personalized playlists are scoped to a storefront; pull it from the
  // playlist URL (e.g. .../zw/playlist/...) and fall back to "us".
  const storefront =
    ((attrs.url || "").match(/music\.apple\.com\/([a-z]{2})\//) || [])[1] || "us";

  const tracksJson = await getJson(
    `${API}/catalog/${storefront}/playlists/${playlist.id}/tracks?limit=${HEAVY_ROTATION_LIMIT}`,
    "heavy rotation tracks"
  );
  const data = tracksJson && Array.isArray(tracksJson.data) ? tracksJson.data : [];
  const tracks = data.map(toTrack);
  if (!tracks.length) return null;

  return {
    name: attrs.name || "Heavy Rotation",
    url: attrs.url || "",
    artwork: formatArtwork(attrs.artwork && attrs.artwork.url, 240),
    tracks,
  };
}
