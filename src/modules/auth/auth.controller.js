const { accessCookieOptions } = require("./auth.cookies");
const authService = require("./auth.service");

// Register: δημιουργεί user, υπογράφει JWT, το βάζει σε cookie
async function register(req, res) {
  const { name, email, password } = req.validated.body;

  const { user, token } = await authService.register({ name, email, password });

  // Αποθήκευση JWT σε httpOnly cookie
  res.cookie("accessToken", token, accessCookieOptions);

  res.status(201).json({
    status: "success",
    data: { user },
  });
}

// Login: ελέγχει credentials, υπογράφει JWT, cookie
async function login(req, res) {
  const { email, password } = req.validated.body;

  const { user, token } = await authService.login({ email, password });

  res.cookie("accessToken", token, accessCookieOptions);

  res.status(200).json({
    status: "success",
    data: { user },
  });
}

// Logout: καθαρίζει το cookie
async function logout(_req, res) {
  // Θέτουμε το cookie να λήξει άμεσα
  res.cookie("accessToken", "", {
    ...accessCookieOptions,
    maxAge: 0,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out",
  });
}

module.exports = { register, login, logout };
