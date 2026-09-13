const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("/data/chacha.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, role TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS auctions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, spec TEXT, status TEXT, commission TEXT, market_price TEXT, min_price TEXT, image TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS bids (id INTEGER PRIMARY KEY AUTOINCREMENT, auction_id INTEGER, user_id INTEGER, bid_amount REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, auction_id INTEGER, amount REAL, method TEXT, status TEXT)");
});

module.exports = db;
