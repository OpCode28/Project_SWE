const { getHotels } = require("../models/hotelModel");
const { sendJson } = require("../utils/http");
const { getStoreMode } = require("../config/db");

async function handleHotelRoutes(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/hotels") {
    const city = url.searchParams.get("city");
    const hotels = await getHotels(city);
    sendJson(response, 200, { hotels, databaseMode: getStoreMode() });
    return true;
  }

  return false;
}

module.exports = {
  handleHotelRoutes
};
