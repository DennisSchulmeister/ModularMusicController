import dotenv        from "dotenv";
import express       from "express";
import qs            from "qs";
import path          from "node:path";
import url           from "node:url";
import process       from "node:process";

import {logRequest}  from "./middleware.js";
import {handleError} from "./middleware.js";
import {logger}      from "./utils.js";
import routeHandlers from "./routes/index.js";

// Display program name
console.log("Modular Music Controller - Web Configuration Portal (Mock Server)");
console.log("=================================================================");
console.log();

// Read configuration values
dotenv.config();

const config = {
    host: process.env.LISTEN_HOST || "",
    port: parseInt(process.env.LISTEN_PORT || "9000"),
};

// Start web server
const app = express();

app.set("query parser", (str: string) => qs.parse(str));
app.set("trust proxy", true);

const sourceDir = path.dirname(url.fileURLToPath(import.meta.url));
const staticDir = path.join(sourceDir, "..", "static");

app.use(logRequest(logger));
app.use(express.static(staticDir));
app.use(express.json());

for (let routeHandler of routeHandlers || []) {
    routeHandler(app);
}

app.use(handleError(logger));

const server = app.listen(config.port, config.host, () => {
    logger.info(`Server listening on ${config.host}:${config.port}`);
});

// Graceful Shutdown: Aktive Requests zu Ende bearbeiten, aber keine neuen Requests
// mehr akzeptieren, wenn der Server beendet werden soll.
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down server.");
    server.close();
});

process.on("SIGINT", () => {
    console.log("\nSIGINT received. Shutting down server.");
    server.close();
});