import express from "express";
import resourcesRouter from "./routes/resources.js";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";

dotenv.config();
const port = process.env.PORT || 5001;
const hostname = process.env.HOST || "127.0.0.1";

const app = express();

// --------------- Middleware ---------------
app.use(express.json());
app.use(requestLogger);



// routes 
app.use("/resources", resourcesRouter);

// Middleware for error handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server listening at http://${hostname}:${port}`);
    // console.log(`Resources GET endpoint: http://${hostname}:${port}/resources`);
    // console.log(`Test valid GET endpoint for Resources/:id : http://${hostname}:${port}/resources/1`);
    // console.log(`Test INVALID GET endpoint for Resources/:id: http://${hostname}:${port}/resources/99`);
});
