const { readJsonBody } = require("../middleware/json");
const { findHotelByIdOrName } = require("../models/hotelModel");
const { createBooking, findBookingById, markBookingPaid } = require("../models/bookingModel");
const { createPayment } = require("../models/paymentModel");
const { nightsBetween, createBookingId, createPaymentId } = require("../utils/booking");
const { createTicketPdf } = require("../utils/pdf");
const { sendJson } = require("../utils/http");
const { getStoreMode } = require("../config/db");

async function handleBookingRoutes(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/bookings") {
    const input = await readJsonBody(request);
    const hotel = await findHotelByIdOrName(input.hotelId, input.hotel);
    if (!hotel) {
      sendJson(response, 400, { error: "Hotel not found." });
      return true;
    }

    const stayNights = nightsBetween(input.checkin, input.checkout);
    if (!input.guestName || !input.email || !input.phone || stayNights < 1) {
      sendJson(response, 400, { error: "Guest details and valid dates are required." });
      return true;
    }

    const subtotal = hotel.pricePerNight * stayNights;
    const taxes = Math.round(subtotal * 0.12);
    const booking = {
      id: createBookingId(),
      status: "Pending Payment",
      paymentStatus: "Unpaid",
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      guestName: input.guestName,
      email: input.email,
      phone: input.phone,
      roomType: input.roomType || "Single Room",
      guests: input.guests || "1 Guest",
      checkin: input.checkin,
      checkout: input.checkout,
      nights: stayNights,
      pricePerNight: hotel.pricePerNight,
      taxes,
      total: subtotal + taxes,
      createdAt: new Date().toISOString()
    };

    await createBooking(booking);
    sendJson(response, 201, { booking, databaseMode: getStoreMode() });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/payments") {
    const input = await readJsonBody(request);
    const booking = await findBookingById(input.bookingId);
    if (!booking) {
      sendJson(response, 404, { error: "Booking not found." });
      return true;
    }

    booking.status = "Confirmed";
    booking.paymentStatus = "Paid";
    const payment = {
      id: createPaymentId(),
      bookingId: booking.id,
      method: input.method,
      reference: input.reference,
      amount: booking.total,
      paidAt: new Date().toISOString()
    };

    await markBookingPaid(booking);
    await createPayment(payment);
    sendJson(response, 200, { booking, payment, databaseMode: getStoreMode() });
    return true;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/bookings/") && url.pathname.endsWith("/ticket")) {
    const bookingId = url.pathname.split("/")[3];
    const booking = await findBookingById(bookingId);
    if (!booking) {
      sendJson(response, 404, { error: "Booking not found." });
      return true;
    }

    const pdf = createTicketPdf(booking);
    response.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="MyHotel-Ticket-${booking.id}.pdf"`,
      "Access-Control-Allow-Origin": "*"
    });
    response.end(pdf);
    return true;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/bookings/")) {
    const bookingId = url.pathname.split("/").pop();
    const booking = await findBookingById(bookingId);
    if (!booking) {
      sendJson(response, 404, { error: "Booking not found." });
      return true;
    }

    sendJson(response, 200, { booking, databaseMode: getStoreMode() });
    return true;
  }

  return false;
}

module.exports = {
  handleBookingRoutes
};
