const { AppError } = require("../errors/AppError");
const { verifyToken } = require("../utils/tokens");
const { User } = require("../../modules/users/user.model");

async function protect(req, _res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next(new AppError("You are not logged in", 401));

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return next(new AppError("Invalid or expired token", 401));
    }

    // NOTE: active είναι select:false, άρα το φέρνουμε ρητά
    const user = await User.findById(payload.id).select("+active");
    if (!user) return next(new AppError("User no longer exists", 401));

    if (user.active === false) {
      return next(new AppError("Account is deactivated", 401));
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function restrictTo(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}

module.exports = { protect, restrictTo };
