const { AppError } = require("../errors/AppError");

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    });

    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      return next(new AppError(message, 400));
    }

    req.validated = result.data; // εδώ μπαίνουν τα clean data
    next();
  };
}

module.exports = { validate };
