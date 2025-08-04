import express from "express";
import path from "path";
import { readFile } from 'fs/promises';
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname,"config.json");

// read the config file and add the info to the variables
const config = JSON.parse(await readFile(configPath, "utf-8"));
const {port, hostname} = config;


// main node
app.get("/", (req,res) => {
    res.send("Welcome to Resource Catalog");
});

// /resources node, that reads resources.JSON
app.get("/resources", async (req,res) => {

    const resources = path.join(__dirname, "data/resources.json");
    try {
        const fileData = await readFile(resources, "utf-8");
        const json = JSON.parse(fileData);
        res.json(json);
    } catch (error) {
        console.error(`Error reading ${resources}`, error);
        res.status(500).send(`Error loading ${resources}`);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://${hostname}:${port}`);
    console.log(`Resources GET endpoint: http://${hostname}:${port}/resources`);

});
