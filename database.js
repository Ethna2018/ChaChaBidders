const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Always use Render's writable /data folder
const dbPath = path.join("/data", "chacha.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
  } else {
    console.log("Connected to SQLite at", dbPath);
  }
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, role TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS auctions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, spec TEXT, status TEXT, commission TEXT, market_price TEXT, min_price TEXT, image TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS bids (id INTEGER PRIMARY KEY AUTOINCREMENT, auction_id INTEGER, user_id INTEGER, bid_amount REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, auction_id INTEGER, amount REAL, method TEXT, status TEXT)");
});

module.exports = db;
