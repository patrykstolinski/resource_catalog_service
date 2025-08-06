import express from "express";
import resourcesRouter from "./routes/resources.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5001;
const hostname = process.env.HOST || "127.0.0.1";

const app = express();

// --------------- Middleware ---------------
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method}: ${req.path}`);
    next();
});

// routes 
app.use("/resources", resourcesRouter);

// Error handling
app.use((err, req,res,next) => {
    console.error(err.stack)
    res.status(500).json({error: "Internal Server Error. Something broke."});
});

app.listen(port, () => {
    console.log(`Server listening at http://${hostname}:${port}`);
    // console.log(`Resources GET endpoint: http://${hostname}:${port}/resources`);
    // console.log(`Test valid GET endpoint for Resources/:id : http://${hostname}:${port}/resources/1`);
    // console.log(`Test INVALID GET endpoint for Resources/:id: http://${hostname}:${port}/resources/99`);
});
