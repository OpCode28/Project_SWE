const { getDb, getStoreMode, readData, writeData } = require("../config/db");

async function createPayment(payment) {
  if (getStoreMode() === "mongodb-atlas") {
    await getDb().collection("payments").insertOne(payment);
    return payment;
  }

  const data = readData();
  data.payments.push(payment);
  writeData(data);
  return payment;
}

module.exports = {
  createPayment
};
