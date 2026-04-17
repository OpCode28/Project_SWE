function pdfText(value) {
  return String(value || "").replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "");
}

function createTicketPdf(booking) {
  const lines = [
    "MyHotel Booking Ticket",
    "Booking ID: " + booking.id,
    "Status: " + booking.status + " / " + booking.paymentStatus,
    "Guest: " + booking.guestName,
    "Email: " + booking.email,
    "Phone: " + booking.phone,
    "Hotel: " + booking.hotelName,
    "City: " + booking.city,
    "Room: " + booking.roomType,
    "Guests: " + booking.guests,
    "Check-in: " + booking.checkin,
    "Check-out: " + booking.checkout,
    "Nights: " + booking.nights,
    "Total Paid: Rs. " + Number(booking.total || 0).toLocaleString("en-IN")
  ];

  const stream = lines.map((line, index) => {
    return "BT /F1 " + (index ? "11" : "18") + " Tf 50 " + (780 - index * 30) + " Td (" + pdfText(line) + ") Tj ET";
  }).join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    "5 0 obj << /Length " + stream.length + " >> stream\n" + stream + "\nendstream endobj\n"
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach(object => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xref = pdf.length;
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index++) {
    pdf += String(offsets[index]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += "trailer << /Root 1 0 R /Size 6 >>\nstartxref\n" + xref + "\n%%EOF";
  return Buffer.from(pdf, "binary");
}

module.exports = {
  createTicketPdf
};
