import express from "express";
import path from "path";
import { readFileSync } from 'fs';
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const data_file = path.join(__dirname, "data/resources.json");

// read the config file and add the info to the variables
const configPath = path.join(__dirname,"config.json");
let config;
try {
    const configData = readFileSync(configPath, "utf-8");
    config = JSON.parse(configData);
} catch (error) {
    console.error("Failed to load config", error.message);
}
const {port, hostname} = config;


// main node
app.get("/", (req,res) => {
    res.send("Welcome to Resource Catalog");
});

// /resources node, that reads resources.JSON
app.get("/resources", async (req,res) => {

    
    try {
        const data = readFileSync(data_file, "utf-8");
        const resources = JSON.parse(data);
        res.json(resources);
    } catch (error) {
        console.error(`Error reading ${resources}`, error);
        res.status(500).send(`Error loading ${resources}`);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://${hostname}:${port}`);
    console.log(`Resources GET endpoint: http://${hostname}:${port}/resources`);

});
