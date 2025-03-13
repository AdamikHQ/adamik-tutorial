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

    // Construct the full URL to the SODOT vertex
    const targetUrl = `${vertexUrl}/ed25519/create`;
    console.log(`Proxying ed25519/create request to: ${targetUrl}`);
    console.log(`Method: ${req.method}`);

    // Forward the request to the SODOT vertex
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
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
