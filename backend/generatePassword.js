const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "Admin123@";

  const hash = await bcrypt.hash(password, 10);

  console.log(hash);
}

generateHash();

