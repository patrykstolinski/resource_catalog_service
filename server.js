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

// load resources.json function
const resources = path.join(__dirname, "data/resources.json");

// load any JSON data you want.
async function loadData(data) {
    const file_data = await readFile(data, "utf-8");
    return JSON.parse(file_data);
}

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method}: ${req.path}`);
    next();
});

// Middleware to parse JSON object
app.use(express.json());

// main node
app.get("/", (req,res) => {
    res.send("Welcome to Resource Catalog");
});

// /resources node, that reads resources.JSON
app.get("/resources", async (req,res) => {    
    try {
        const json = await loadData(resources);
        res.json(json);
    } catch (error) {
        console.error(`Error reading ${resources}`, error);
        res.status(500).send(`Error loading ${resources}`);
    }
});

// /resources/id node
app.get("/resources/:id", async (req,res) => {    
    try {        
        const json = await loadData(resources); // use load function to load resources 
        const resourceId = req.params.id;// req.params look for key (in this case "id") and assigns the value to resourceId        
        const resource = json.find(item => item.id === resourceId);// arrow function - for each item, check if item.id is the same as resourceId         
        if(!resource) {
            return res.status(404).json({ error: `Resource with ID ${resourceId} not found.`});
        }; // if no resource found, throw 404        
        res.json(resource);// return the single resource 

    } catch (error) {
        console.error(`Error reading ${resources}`, error);
        res.status(500).json({error: `Error loading ${resources}`});
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://${hostname}:${port}`);
    console.log(`Resources GET endpoint: http://${hostname}:${port}/resources`);
    console.log(`Resources/:id test GET endpoint: http://${hostname}:${port}/resources/1`);
    console.log(`Resources/:id bad GET endpoint: http://${hostname}:${port}/resources/99`);

});
