import dotenv from "dotenv";
dotenv.config();
import { connectDB, disConnectDB } from "./config/db.js";
import { app } from "./app.js";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server Listening at PORT : ${PORT} 👌`);
    });
    //*  Gracefull shutdown
    let shuttingDown: boolean = false;
    const shutDown = async (signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`\n${signal} received. Shutting Down server ⏳`);
      //* Force exit after 10s if connections refuse to close
      const forceExit = setTimeout(() => {
        console.error("Forced shutdown due to timeout ⚠️");
        process.exit(1);
      }, 10000);
      server.close(async () => {
        await disConnectDB();
        process.exit(0);
      });
    };
    process.on("SIGINT", shutDown);
    process.on("SIGTERM", shutDown);
  } catch (err) {
    console.error("Error ⚠️ while starting Server", err);
  }
};

startServer();
