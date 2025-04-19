require("dotenv").config();
require("./src/utils/cronJobs.js");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./src/models");
const routes = require("./src/routes");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Socket.IO configuration
const io = new Server(server, {
  // Attach to HTTP server, not Express app
  cors: {
    origin: process.env.FRONTEND_URL || [
      "http://localhost:3000",
      "http://10.0.2.2:5001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
});

// Track connections
const bookingConnections = new Map();

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  const bookingRooms = new Map();

  socket.on("join-booking", (bookingId) => {
    if (bookingRooms.has(socket.id)) {
      socket.leave(bookingRooms.get(socket.id));
    }

    const roomName = `booking-${bookingId}`;
    socket.join(roomName);
    bookingRooms.set(socket.id, roomName);

    console.log(`Socket ${socket.id} joined booking room ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    bookingRooms.delete(socket.id);
  });

  socket.on("error", (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });
});

// Make io available app-wide
app.set("io", io);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    "http://localhost:3000",
    "http://10.0.2.2:5001",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", "http://localhost:3000"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:3000",
        ],
      },
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 8090;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Use server.listen() instead of app.listen()
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO available at ws://localhost:${PORT}/socket.io/`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
