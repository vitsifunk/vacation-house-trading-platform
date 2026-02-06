const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

console.log("__dirname:", __dirname);
console.log("MONGO_URI =", process.env.MONGO_URI);
