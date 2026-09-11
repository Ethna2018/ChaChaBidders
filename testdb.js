const db = require("./database");

db.run("INSERT INTO users (name, phone, role) VALUES (?, ?, ?)", ["Alemseged", "+251911000000", "admin"], (err) => {
  if (err) console.error(err);
  else console.log("User added successfully!");
});
