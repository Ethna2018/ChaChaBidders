const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const multer = require("multer"); // for file uploads
const path = require("path");
const db = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Auction state
let highBids = [];
let lowBids = [];
let currentHighBid = 0;
let currentLowBid = null;

// Auction content
let highSpec = "";
let highStatus = "";
let highCommission = "";
let highMarket = "";
let highMinPrice = "";
let highImage = "";

let lowSpec = "";
let lowStatus = "";
let lowCommission = "";
let lowMarket = "";
let lowMinPrice = "";
let lowImage = "";

let advertText = "";
let videoFile = "sample.mp4"; // default video

// Helper functions
function findHighWinner(callback) {
  db.all("SELECT bid_amount, user_id FROM bids WHERE auction_id = 1", [], (err, rows) => {
    if (err) {
      console.error(err);
      callback(null);
    } else if (rows.length === 0) {
      callback(null);
    } else {
      const highest = rows.reduce((a, b) => (a.bid_amount > b.bid_amount ? a : b));
      callback(highest);
    }
  });
}

function findUniqueLowWinner(callback) {
  db.all("SELECT bid_amount, user_id FROM bids WHERE auction_id = 2", [], (err, rows) => {
    if (err) {
      console.error(err);
      callback(null);
    } else if (rows.length === 0) {
      callback(null);
    } else {
      const bidCounts = {};
      rows.forEach(b => {
        bidCounts[b.bid_amount] = (bidCounts[b.bid_amount] || 0) + 1;
      });
      const uniqueBids = Object.keys(bidCounts).filter(b => bidCounts[b] === 1).map(Number);
      if (uniqueBids.length === 0) {
        callback(null);
      } else {
        const lowestUnique = Math.min(...uniqueBids);
        const winner = rows.find(b => b.bid_amount === lowestUnique);
        callback(winner);
      }
    }
  });
}

// Socket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Place bid
  socket.on("placeBid", (data) => {
  const userId = data.userId || 1; // fallback if no login yet

  if (data.bidType === "high") {
    db.run("INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)", [1, userId, data.bid]);
    io.emit("updateHighBid", data.bid);
  } else if (data.bidType === "unique_low") {
    db.run("INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)", [2, userId, data.bid]);
    io.emit("updateLowBid", "pending");
  }
});

  // Send current video file to new clients
  socket.emit("updateVideo", videoFile);
});
// Upload endpoints

// General Advert
app.post("/api/uploadAdvert", (req, res) => {
  advertText = req.body.advert;
  io.emit("updateAdvert", advertText);
  io.emit("notification", "Advert updated");
  res.json({ success: true });
});

// Video Upload
app.post("/api/uploadVideo", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  videoFile = "uploads/" + req.file.filename;
  io.emit("updateVideo", videoFile);
  io.emit("notification", "Video updated");
  res.json({ success: true, file: videoFile });
});

// High Auction uploads
app.post("/api/uploadHighSpec", (req, res) => {
  highSpec = req.body.spec;
  io.emit("updateHighSpec", highSpec);
  io.emit("notification", "High specification updated");
  res.json({ success: true });
});

app.post("/api/uploadHighStatus", (req, res) => {
  highStatus = req.body.status;
  io.emit("updateHighStatus", highStatus);
  io.emit("notification", "High status updated");
  res.json({ success: true });
});

app.post("/api/uploadHighCommission", (req, res) => {
  highCommission = req.body.commission;
  io.emit("updateHighCommission", highCommission);
  io.emit("notification", "High commission updated");
  res.json({ success: true });
});

app.post("/api/uploadHighMarket", (req, res) => {
  highMarket = req.body.market;
  io.emit("updateHighMarket", highMarket);
  io.emit("notification", "High market price updated");
  res.json({ success: true });
});

app.post("/api/uploadHighMinPrice", (req, res) => {
  highMinPrice = req.body.minPrice;
  io.emit("updateHighMinPrice", highMinPrice);
  io.emit("notification", "High minimum price updated");
  res.json({ success: true });
});

app.post("/api/uploadHighImage", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  highImage = "uploads/" + req.file.filename;
  io.emit("updateHighImage", highImage);
  io.emit("notification", "High auction image updated");
  res.json({ success: true, file: highImage });
});

// Low Auction uploads
app.post("/api/uploadLowSpec", (req, res) => {
  lowSpec = req.body.spec;
  io.emit("updateLowSpec", lowSpec);
  io.emit("notification", "Low specification updated");
  res.json({ success: true });
});

app.post("/api/uploadLowStatus", (req, res) => {
  lowStatus = req.body.status;
  io.emit("updateLowStatus", lowStatus);
  io.emit("notification", "Low status updated");
  res.json({ success: true });
});

app.post("/api/uploadLowCommission", (req, res) => {
  lowCommission = req.body.commission;
  io.emit("updateLowCommission", lowCommission);
  io.emit("notification", "Low commission updated");
  res.json({ success: true });
});

app.post("/api/uploadLowMarket", (req, res) => {
  lowMarket = req.body.market;
  io.emit("updateLowMarket", lowMarket);
  io.emit("notification", "Low market price updated");
  res.json({ success: true });
});

app.post("/api/uploadLowMinPrice", (req, res) => {
  lowMinPrice = req.body.minPrice;
  io.emit("updateLowMinPrice", lowMinPrice);
  io.emit("notification", "Low minimum price updated");
  res.json({ success: true });
});

app.post("/api/uploadLowImage", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  lowImage = "uploads/" + req.file.filename;
  io.emit("updateLowImage", lowImage);
  io.emit("notification", "Low auction image updated");
  res.json({ success: true, file: lowImage });
});
// Auction regulation endpoints

// High Auction
app.post("/api/pauseHighAuction", (req, res) => {
  io.emit("notification", "High auction paused");
  res.json({ success: true });
});
app.post("/api/extendHighAuction", (req, res) => {
  io.emit("notification", "High auction extended");
  res.json({ success: true });
});
app.post("/api/resetHighAuction", (req, res) => {
  highBids = [];
  currentHighBid = 0;
  io.emit("updateHighBid", 0);
  io.emit("notification", "High auction reset");
  res.json({ success: true });
});
app.post("/api/setHighTimer", (req, res) => {
  io.emit("highTimerSet", req.body.minutes);
  io.emit("notification", "High timer set");
  res.json({ success: true });
});
app.post("/api/resetHighTimer", (req, res) => {
  io.emit("highTimerReset");
  io.emit("notification", "High timer reset");
  res.json({ success: true });
});

// Low Auction
app.post("/api/pauseLowAuction", (req, res) => {
  io.emit("notification", "Low auction paused");
  res.json({ success: true });
});
app.post("/api/extendLowAuction", (req, res) => {
  io.emit("notification", "Low auction extended");
  res.json({ success: true });
});
app.post("/api/resetLowAuction", (req, res) => {
  lowBids = [];
  currentLowBid = null;
  io.emit("updateLowBid", "reset");
  io.emit("notification", "Low auction reset");
  res.json({ success: true });
});
app.post("/api/setLowTimer", (req, res) => {
  io.emit("lowTimerSet", req.body.minutes);
  io.emit("notification", "Low timer set");
  res.json({ success: true });
});
app.post("/api/resetLowTimer", (req, res) => {
  io.emit("lowTimerReset");
  io.emit("notification", "Low timer reset");
  res.json({ success: true });
});
app.post("/api/login", (req, res) => {
  const { name, phone } = req.body;
  db.run("INSERT INTO users (name, phone, role) VALUES (?, ?, ?)", [name, phone, "bidder"], function(err) {
    if (err) {
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true, id: this.lastID, name });
    }
  });
});
app.post("/api/payment", (req, res) => {
  const { userId, auctionId, amount, method } = req.body;
  db.run(
    "INSERT INTO transactions (user_id, auction_id, amount, method, status) VALUES (?, ?, ?, ?, ?)",
    [userId, auctionId, amount, method, "verified"],
    function(err) {
      if (err) {
        res.status(500).json({ success: false });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    }
  );
});
// Results broadcasting
app.post("/api/announceResults", (req, res) => {
  findHighWinner((highWinner) => {
    findUniqueLowWinner((lowWinner) => {
      io.emit("updateResults", { highWinner, lowWinner });
      io.emit("notification", "Results announced");
      res.json({ success: true });
    });
  });
});

// Dashboard broadcasting
function broadcastDashboard() {
  io.emit("updateDashboard", {
    highSpec, highStatus, highCommission, highMarket, highMinPrice, highImage,
    lowSpec, lowStatus, lowCommission, lowMarket, lowMinPrice, lowImage,
    advertText, videoFile,
    highBids, lowBids
  });
}

// Call dashboard update after every major change
setInterval(broadcastDashboard, 10000); // every 10 seconds
// Automatic auction closing after 30 minutes
function startAuctionTimers() {
  // High Auction Timer
  setTimeout(() => {
    findHighWinner((highWinner) => {
      io.emit("updateResults", { highWinner });
      io.emit("notification", "High Auction closed automatically");
    });
  }, 30 * 60 * 1000); // 30 minutes

  // Unique Low Auction Timer
  setTimeout(() => {
    findUniqueLowWinner((lowWinner) => {
      io.emit("updateResults", { lowWinner });
      io.emit("notification", "Unique Low Auction closed automatically");
    });
  }, 30 * 60 * 1000); // 30 minutes
}

// Start timers when server runs
startAuctionTimers();

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
