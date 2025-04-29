// api/sodot-proxy.js
import { json } from "micro";

export default async function handler(req, res) {
  try {
    // Extract vertex number from query parameter
    const vertexNumber = req.query.vertex;
    if (vertexNumber === undefined) {
      return res.status(400).json({ error: "Missing vertex parameter" });
    }

    // Get the path from the URL (everything after the vertex parameter)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathMatch = url.pathname.match(/\/api\/sodot-proxy(\/.*)?/);
    let path = "";

    if (pathMatch && pathMatch[1]) {
      path = pathMatch[1];
    } else if (req.url.includes("?")) {
      // If there's no path in the URL but there are query parameters
      const fullPath = req.url.split("?")[0];
      const pathParts = fullPath.split("/api/sodot-proxy");
      if (pathParts.length > 1 && pathParts[1]) {
        path = pathParts[1];
      }
    }

    // Get the environment variables for the vertex
    const vertexUrl = process.env[`SODOT_VERTEX_URL_${vertexNumber}`];
    const apiKey = process.env[`SODOT_VERTEX_API_KEY_${vertexNumber}`];

    if (!vertexUrl || !apiKey) {
      return res.status(500).json({
        error: `Missing environment variables for vertex ${vertexNumber}`,
      });
    }

    // Parse the request body if it's a POST, PUT, or PATCH request
    let body;
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      body = await json(req);
    }

    // Construct the full URL to the SODOT vertex
    const targetUrl = `${vertexUrl}${path}`;
    console.log(`Proxying request to: ${targetUrl}`);

    // Forward the request to the SODOT vertex
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
        ...req.headers,
        // Remove headers that might cause issues
        host: undefined,
        "x-forwarded-host": undefined,
        "x-forwarded-proto": undefined,
        "x-forwarded-for": undefined,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get the response data
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Set the status code and send the response
    res.status(response.status);

    // Set response headers
    for (const [key, value] of response.headers.entries()) {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Send the response
    if (typeof data === "string") {
      res.send(data);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
}
