const { getDb, getStoreMode, readData, writeData } = require("../config/db");

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt
  };
}

async function createUser(user) {
  if (getStoreMode() === "mongodb-atlas") {
    await getDb().collection("users").insertOne(user);
    return sanitizeUser(user);
  }

  const data = readData();
  data.users.push(user);
  writeData(data);
  return sanitizeUser(user);
}

async function findUserByEmail(email) {
  if (getStoreMode() === "mongodb-atlas") {
    return getDb().collection("users").findOne({ email: String(email || "").toLowerCase() }, { projection: { _id: 0 } });
  }

  const data = readData();
  return data.users.find(function (item) {
    return item.email === String(email || "").toLowerCase();
  }) || null;
}

async function findUserByPhone(phone) {
  if (getStoreMode() === "mongodb-atlas") {
    return getDb().collection("users").findOne({ phone: String(phone || "") }, { projection: { _id: 0 } });
  }

  const data = readData();
  return data.users.find(function (item) {
    return item.phone === String(phone || "");
  }) || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByPhone,
  sanitizeUser
};
