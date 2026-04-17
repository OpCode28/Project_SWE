function setCorsHeaders(response, extraHeaders = {}) {
  response.writeHead(extraHeaders.statusCode || 200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extraHeaders.headers
  });
}

module.exports = {
  setCorsHeaders
};
