// functions/ftc-events-proxy/src/main.js
//
// Appwrite Function: ftc-events-proxy
//
// Replaces the public CORS proxy that schedule.html was using to reach
// FIRST's official FTC Events API. Forwards GET requests, adds the Basic
// Auth header using credentials stored as Function environment variables.
//
// Client sends a GET request with the target path as a query param, e.g.:
//   /?path=/2026/events&teamNumber=12345
// Function forwards to:
//   https://ftc-api.firstinspires.org/v2.0/2026/events?teamNumber=12345
//
// Required environment variables (set in console → Functions → Settings → Variables):
//   FTC_EVENTS_USERNAME, FTC_EVENTS_API_KEY
//
// Execute Access: role "users"

export default async ({ req, res, error }) => {
  const FTC_EVENTS_USERNAME = process.env.FTC_EVENTS_USERNAME;
  const FTC_EVENTS_API_KEY = process.env.FTC_EVENTS_API_KEY;

  if (!FTC_EVENTS_USERNAME || !FTC_EVENTS_API_KEY) {
    error('FTC_EVENTS_USERNAME / FTC_EVENTS_API_KEY not set on this Function.');
    return res.json({ error: 'Server misconfigured — FTC Events credentials not set.' }, 500);
  }

  const path = req.query.path;
  if (!path) {
    return res.json({ error: "Missing 'path' query param, e.g. ?path=/2026/events&teamNumber=12345" }, 400);
  }

  const targetUrl = `https://ftc-api.firstinspires.org/v2.0${path}`;
  const authHeader = 'Basic ' + Buffer.from(`${FTC_EVENTS_USERNAME}:${FTC_EVENTS_API_KEY}`).toString('base64');

  try {
    const ftcRes = await fetch(targetUrl, {
      headers: { 'Authorization': authHeader }
    });

    const data = await ftcRes.text();
    return res.text(data, ftcRes.status, { 'Content-Type': 'application/json' });

  } catch (err) {
    error(err.message || String(err));
    return res.json({ error: 'Failed to reach FTC Events API' }, 500);
  }
};