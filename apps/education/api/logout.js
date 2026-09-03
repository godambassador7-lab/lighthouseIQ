"use strict";

module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Set-Cookie", "lqedu_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  response.statusCode = 204;
  response.end();
};
