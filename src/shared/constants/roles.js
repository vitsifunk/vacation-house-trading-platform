// Κεντρικά roles για όλο το project (μία πηγή αλήθειας)
const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));

module.exports = { ROLES, ALL_ROLES };
