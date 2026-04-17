function nightsBetween(checkin, checkout) {
  return Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
}

function createBookingId() {
  return "MH" + Date.now().toString(36).toUpperCase();
}

function createPaymentId() {
  return "PAY" + Date.now().toString(36).toUpperCase();
}

module.exports = {
  nightsBetween,
  createBookingId,
  createPaymentId
};
