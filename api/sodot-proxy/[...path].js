import { json } from "micro";

export default async function handler(req, res) {
  try {
    // Extract vertex number from query parameter
    const vertexNumber = req.query.vertex;
    if (vertexNumber === undefined) {
      return res.status(400).json({ error: "Missing vertex parameter" });
    }

    // Get the path from the URL path segments
    let path = "";
    if (req.query.path) {
      // Handle both array and string cases
      if (Array.isArray(req.query.path)) {
        path = `/${req.query.path.join("/")}`;
      } else if (typeof req.query.path === "string") {
        path = `/${req.query.path}`;
      }
    }

    console.log(`Path segments:`, req.query.path);
    console.log(`Constructed path: ${path}`);

    // Get the environment variables for the vertex
    const vertexUrl = process.env[`SODOT_VERTEX_URL_${vertexNumber}`];
    const apiKey = process.env[`SODOT_VERTEX_API_KEY_${vertexNumber}`];

    if (!vertexUrl || !apiKey) {
      return res.status(500).json({
        error: `Missing environment variables for vertex ${vertexNumber}`,
        vertexUrl: !!vertexUrl,
        apiKey: !!apiKey,
      });
    }

    const curve = path.split("/")[1];
    let keyIds = [];
    if (curve === "ecdsa") {
      keyIds = process.env[`SODOT_EXISTING_ECDSA_KEY_IDS`].split(",");
    } else if (curve === "ed25519") {
      keyIds = process.env[`SODOT_EXISTING_ED25519_KEY_IDS`].split(",");
    }

    // Parse the request body if it's a POST, PUT, or PATCH request
    let body;
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      try {
        body = await json(req);
      } catch (error) {
        console.error("Error parsing request body:", error);
        // If parsing fails, try to get the raw body
        body = req.body;
      }
    }

    // Construct the full URL to the SODOT vertex
    const targetUrl = `${vertexUrl}${path}`;
    console.log(`Proxying request to: ${targetUrl}`);
    console.log(`Request method: ${req.method}`);
    console.log(`Request body:`, body);

    if (body && body.key_id) {
      body.key_id = keyIds[vertexNumber];
    }

    // Forward the request to the SODOT vertex
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
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

    console.log(`Response status: ${response.status}`);
    console.log(
      `Response data:`,
      typeof data === "string" ? data.substring(0, 100) + "..." : data
    );

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
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack,
    });
  }
}
