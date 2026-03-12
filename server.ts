import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initDb } from "./server/models/database.js";
import authRoutes from "./server/routes/auth_routes.js";
import photoRoutes from "./server/routes/photo_routes.js";
import personRoutes from "./server/routes/person_routes.js";
import deliveryRoutes from "./server/routes/delivery_routes.js";
import editorRoutes from "./server/routes/editor_routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initDb();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use("/uploads", express.static("uploads"));

  // Modular API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/photos", photoRoutes);
  app.use("/api/people", personRoutes);
  app.use("/api/delivery", deliveryRoutes);
  app.use("/api/editor", editorRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
