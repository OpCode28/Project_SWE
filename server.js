const http = require("http");
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
  });
}

startServer().catch(error => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
