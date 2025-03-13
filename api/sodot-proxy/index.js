import { json } from "micro";

export default async function handler(req, res) {
  try {
    // Extract vertex number from query parameter
    const vertexNumber = req.query.vertex;
    if (vertexNumber === undefined) {
      return res.status(400).json({ error: "Missing vertex parameter" });
    }

    // Get the environment variables for the vertex
    const vertexUrl = process.env[`VITE_SODOT_VERTEX_URL_${vertexNumber}`];
    const apiKey = process.env[`VITE_SODOT_VERTEX_API_KEY_${vertexNumber}`];

    if (!vertexUrl || !apiKey) {
      return res.status(500).json({
        error: `Missing environment variables for vertex ${vertexNumber}`,
        vertexUrl: !!vertexUrl,
        apiKey: !!apiKey,
      });
    }

    // Get the path from the URL (everything after /api/sodot-proxy)
    const path = req.url.split("/api/sodot-proxy")[1] || "";

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
    console.log(`Method: ${req.method}`);
    console.log(`Body: ${JSON.stringify(body)}`);

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
    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`Response status: ${response.status}`);
    console.log(
      `Response data: ${typeof data === "string" ? data : JSON.stringify(data)}`
    );

    // Return the response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack,
    });
  }
}
