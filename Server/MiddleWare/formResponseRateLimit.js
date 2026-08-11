const rateLimit = require("express-rate-limit");

const windowMs =
  Number(process.env.FORM_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const max = Number(process.env.FORM_RATE_LIMIT_MAX) || 5;

const formResponseRateLimit = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
  keyGenerator: (req) => {
    const forwarded = String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim();
    return forwarded || req.ip || "unknown";
  },
});

module.exports = formResponseRateLimit;
