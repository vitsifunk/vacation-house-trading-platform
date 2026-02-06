// Παίρνει μόνο επιτρεπτά keys από ένα object.
// Χρήσιμο για PATCH /me ώστε να μην αλλάζει role/email κτλ.
function pick(obj, allowedKeys = []) {
  const out = {};
  for (const key of allowedKeys) {
    if (
      obj &&
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined
    ) {
      out[key] = obj[key];
    }
  }
  return out;
}

module.exports = { pick };
