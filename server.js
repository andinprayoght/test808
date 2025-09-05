import express from "express";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3000;

// Parsing body untuk POST/PUT
app.use(express.text({ type: "*/*" }));

async function handleRequest(req) {
  try {
    const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
    const pathParts = url.pathname.split("/");
    const prefix = pathParts[1];
    const remainingPath = "/" + pathParts.slice(2).join("/") + url.search;

    const hosts = {
      twnx1: "https://twnx1-cf.boblcfwudz421.com",
      twnx2: "https://twnx2-cf.boblcfwudz421.com",
      twnx3: "https://twnx3-cf.boblcfwudz421.com",
    };

    const targetHost = hosts[prefix];
    if (!targetHost) {
      return {
        status: 400,
        body: "Invalid prefix. Use /twnx1, /twnx2, or /twnx3 in your URL.",
        headers: { "content-type": "text/plain" },
      };
    }

    const targetUrl = targetHost + remainingPath;

    const customHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      Referer: "https://ppdd02.playerktidfintkd.shop/",
      Origin: "https://ppdd02.playerktidfintkd.shop",
      Cookie: "vc_ts=1757037722532; show_link=false",
    };

    // Clone headers
    const originalHeaders = { ...req.headers };
    delete originalHeaders["host"];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { ...originalHeaders, ...customHeaders },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const buffer = await response.arrayBuffer();

    const headers = {};
    response.headers.forEach((v, k) => {
      headers[k] = v;
    });

    // Tambahkan CORS supaya bisa diakses
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "*";

    return {
      status: response.status,
      body: Buffer.from(buffer),
      headers,
    };
  } catch (err) {
    return {
      status: 500,
      body: "Worker error: " + err.message,
      headers: { "content-type": "text/plain" },
    };
  }
}

app.all("*", async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    return res.status(204).send();
  }

  const result = await handleRequest(req);
  res.set(result.headers);
  res.status(result.status).send(result.body);
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
