const { getDb, getStoreMode, readData } = require("../config/db");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getHotels(city) {
  if (getStoreMode() === "mongodb-atlas") {
    const filter = city ? { city: new RegExp("^" + escapeRegex(city) + "$", "i") } : {};
    return getDb().collection("hotels").find(filter, { projection: { _id: 0 } }).toArray();
  }

  const data = readData();
  return city
    ? data.hotels.filter(hotel => hotel.city.toLowerCase() === city.toLowerCase())
    : data.hotels;
}

async function findHotelByIdOrName(hotelId, hotelName) {
  if (getStoreMode() === "mongodb-atlas") {
    return getDb().collection("hotels").findOne(
      hotelId ? { id: hotelId } : { name: hotelName },
      { projection: { _id: 0 } }
    );
  }

  const data = readData();
  return data.hotels.find(item => item.id === hotelId || item.name === hotelName);
}

module.exports = {
  getHotels,
  findHotelByIdOrName
};
