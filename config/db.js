const fs = require("fs");
const { MongoClient } = require("mongodb");
const { MONGODB_URI, MONGODB_DB_NAME, DATA_FILE } = require("./env");

let storeMode = "local-json";
let db = null;

function normalizeData(data) {
  const normalized = data || {};
  if (!Array.isArray(normalized.hotels)) normalized.hotels = [];
  if (!Array.isArray(normalized.bookings)) normalized.bookings = [];
  if (!Array.isArray(normalized.payments)) normalized.payments = [];
  if (!Array.isArray(normalized.users)) normalized.users = [];
  return normalized;
}

function readData() {
  return normalizeData(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalizeData(data), null, 2));
}

async function initializeDatabase() {
  if (MONGODB_URI) {
    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(MONGODB_DB_NAME);
      storeMode = "mongodb-atlas";
      await seedHotelsIfEmpty();
      console.log("Connected to MongoDB successfully.");
    } catch (err) {
      console.error("MongoDB Connection Failed! Falling back to local-json mode.", err.message);
      storeMode = "local-json";
    }
  }

  return {
    mode: storeMode,
    databaseName: storeMode === "mongodb-atlas" ? MONGODB_DB_NAME : "local-json"
  };
}

async function seedHotelsIfEmpty() {
  const count = await db.collection("hotels").countDocuments();
  if (count > 0) return;
  const data = readData();
  if (data.hotels.length) {
    await db.collection("hotels").insertMany(data.hotels);
  }
}

function getStoreMode() {
  return storeMode;
}

function getDb() {
  return db;
}

module.exports = {
  initializeDatabase,
  readData,
  writeData,
  getStoreMode,
  getDb
};
