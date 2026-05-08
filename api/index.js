import { default as serverEntry } from "../dist/server/index.js";

export default async (req, res) => {
  try {
    // Create a fetch-compatible request
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: ["GET", "HEAD"].includes(req.method) ? null : req,
    });

    // Call the server entry point
    const response = await serverEntry.fetch(request);

    // Set status and headers
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream or send the response
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    res.end();
  } catch (error) {
    console.error("Error in serverless handler:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error", details: error.message }));
  }
};
