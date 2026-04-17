const { getDb, getStoreMode, readData, writeData } = require("../config/db");

async function createBooking(booking) {
  if (getStoreMode() === "mongodb-atlas") {
    await getDb().collection("bookings").insertOne(booking);
    return booking;
  }

  const data = readData();
  data.bookings.push(booking);
  writeData(data);
  return booking;
}

async function findBookingById(bookingId) {
  if (getStoreMode() === "mongodb-atlas") {
    return getDb().collection("bookings").findOne({ id: bookingId }, { projection: { _id: 0 } });
  }

  const data = readData();
  return data.bookings.find(item => item.id === bookingId);
}

async function markBookingPaid(booking) {
  if (getStoreMode() === "mongodb-atlas") {
    await getDb().collection("bookings").updateOne(
      { id: booking.id },
      {
        $set: {
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      }
    );
    return booking;
  }

  const data = readData();
  const index = data.bookings.findIndex(item => item.id === booking.id);
  if (index !== -1) {
    data.bookings[index] = booking;
  }
  writeData(data);
  return booking;
}

module.exports = {
  createBooking,
  findBookingById,
  markBookingPaid
};
