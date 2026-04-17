const { readJsonBody } = require("../middleware/json");
const { sendJson } = require("../utils/http");
const { createUser, findUserByEmail, findUserByPhone, sanitizeUser } = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { getStoreMode } = require("../config/db");

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(0, 10);
}

async function handleAuthRoutes(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const input = await readJsonBody(request);
    const name = String(input.name || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    const phone = normalizePhone(input.phone);
    const password = String(input.password || "");

    if (!name || !email || !phone || !password) {
      sendJson(response, 400, { error: "Name, email, phone, and password are required." });
      return true;
    }

    if (!/^\d{10}$/.test(phone)) {
      sendJson(response, 400, { error: "Phone number must contain exactly 10 digits." });
      return true;
    }

    if (await findUserByEmail(email)) {
      sendJson(response, 409, { error: "An account with this email already exists." });
      return true;
    }

    if (await findUserByPhone(phone)) {
      sendJson(response, 409, { error: "An account with this phone number already exists." });
      return true;
    }

    const user = {
      id: "USR" + Date.now().toString(36).toUpperCase(),
      name: name,
      email: email,
      phone: phone,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    const savedUser = await createUser(user);
    sendJson(response, 201, { user: savedUser, databaseMode: getStoreMode() });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const input = await readJsonBody(request);
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");

    if (!email || !password) {
      sendJson(response, 400, { error: "Email and password are required." });
      return true;
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(response, 401, { error: "Invalid email or password." });
      return true;
    }

    sendJson(response, 200, { user: sanitizeUser(user), databaseMode: getStoreMode() });
    return true;
  }

  return false;
}

module.exports = {
  handleAuthRoutes
};
