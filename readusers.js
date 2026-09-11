const db = require("./database");

db.all("SELECT * FROM users", [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Users in database:");
    console.log(rows);
  }
});
