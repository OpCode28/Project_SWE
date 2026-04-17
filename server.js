const http = require("http");
const https = require("https");
const { URL } = require("url");
const { PORT } = require("./config/env");
const { initializeDatabase } = require("./config/db");
const { sendJson, sendHealth } = require("./utils/http");
const { handleHotelRoutes } = require("./routes/hotelRoutes");
const { handleBookingRoutes } = require("./routes/bookingRoutes");
const { handleAuthRoutes } = require("./routes/authRoutes");

async function startServer() {
  const storeInfo = await initializeDatabase();

  const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning"
      });
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        sendHealth(response, storeInfo.databaseName);
        return;
      }

      if (await handleAuthRoutes(request, response, url)) return;
      if (await handleHotelRoutes(request, response, url)) return;
      if (await handleBookingRoutes(request, response, url)) return;

      sendJson(response, 404, { error: "Route not found." });
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`MyHotel backend running at http://0.0.0.0:${PORT}`);
    console.log(`Database mode: ${storeInfo.mode}`);
    console.log(`Database name: ${storeInfo.databaseName}`);

    // Keep-alive: ping self every 14 minutes so Render free tier never sleeps
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_URL) {
      const pingUrl = `${RENDER_URL}/api/health`;
      console.log(`Keep-alive enabled: pinging ${pingUrl} every 14 minutes`);
      setInterval(() => {
        const client = pingUrl.startsWith("https") ? https : http;
        client.get(pingUrl, (res) => {
          console.log(`Keep-alive ping OK: ${res.statusCode}`);
        }).on("error", (err) => {
          console.warn(`Keep-alive ping failed: ${err.message}`);
        });
      }, 14 * 60 * 1000); // every 14 minutes
    }
  });
}

startServer().catch(error => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
