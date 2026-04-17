const { getStoreMode } = require("../config/db");
const { setCorsHeaders } = require("../middleware/cors");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning"
  });
  response.end(JSON.stringify(payload));
}

function sendHealth(response, databaseName) {
  sendJson(response, 200, {
    ok: true,
    databaseMode: getStoreMode(),
    databaseName: databaseName || "local-json"
  });
}

module.exports = {
  sendJson,
  sendHealth
};
