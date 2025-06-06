import { json } from "micro";

export default async function handler(req, res) {
  try {
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
    const apiKey = process.env[`ADAMIK_API_KEY`];
    const apiBaseUrl = process.env[`ADAMIK_API_BASE_URL`];

    if (!apiKey) {
      return res.status(500).json({
        error: `Missing environment variables for adamik proxy`,
        apiKey: !!apiKey,
        apiBaseUrl: !!apiBaseUrl,
      });
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

    // Construct the full URL to the adamik proxy
    const targetUrl = `${apiBaseUrl}${path}`;
    console.log(`Proxying request to: ${targetUrl}`);
    console.log(`Request method: ${req.method}`);
    console.log(`Request body:`, body);

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

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack,
    });
  }
}
