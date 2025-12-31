import "dotenv/config";
import app from "./app.js";
import cacheService from "./services/cache.service.js";
import memoryStore from "./store/memoryStore.js";

const port = process.env.SERVER_PORT;

async function startServer() {
  try {
    await cacheService.initialize();
    await memoryStore.initialize();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 API: ${process.env.SERVER_BASE_URL}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
