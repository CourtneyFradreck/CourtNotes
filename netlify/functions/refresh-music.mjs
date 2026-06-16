// Scheduled Netlify Function: triggers a fresh site build every 6 hours so the
// build-time Apple Music fetch (src/_data/music.mjs) refreshes the About page.
//
// Requires the NETLIFY_BUILD_HOOK_URL env var (a Netlify build hook URL). If it
// is not set the function no-ops rather than erroring.

import { schedule } from "@netlify/functions";

export const handler = schedule("0 */6 * * *", async () => {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!hookUrl) {
    console.warn(
      "[refresh-music] NETLIFY_BUILD_HOOK_URL is not set; skipping rebuild trigger."
    );
    return { statusCode: 200 };
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });
    console.log(`[refresh-music] Build hook POST responded ${res.status}.`);
  } catch (err) {
    console.error(`[refresh-music] Failed to trigger build hook: ${err.message}`);
  }

  return { statusCode: 200 };
});
