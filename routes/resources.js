import express from "express";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesPath = path.join(__dirname, "../data/resources.json");

async function loadData(data) {
    const file_data = await readFile(data, "utf-8");
    return JSON.parse(file_data);
};

// GET /resources
router.get("/", async (req, res) => {
    try {
        const json = await loadData(resourcesPath);
        res.json(json);
    } catch (error) {
        console.error(`Error reading ${resourcesPath}`, error);
        res.status(500).json({ error: `Error loading ${resourcesPath}` });
    }
});

// GET /resources/:id
router.get("/:id", async (req, res) => {
    try {
        const json = await loadData(resourcesPath);
        const resourceId = req.params.id;
        const resource = json.find(item => item.id === resourceId);
        if (!resource) {
            return res.status(404).json({ error: `Resource with ID ${resourceId} not found.` });
        }
        res.json(resource);
    } catch (error) {
        console.error(`Error reading ${resourcesPath}`, error);
        res.status(500).json({ error: `Error loading ${resourcesPath}` });
    }
});

// POST /resources
router.post("/", async (req, res) => {
    const {type, title} = req.body; 

    if (!title || !type) {
        return res.status(400).json({error: `Missing required fields - title or type.`}); 
    }; // check if title or type is missing

    try {
        const data = await loadData(resourcesPath);
        const auth = uuidv4(); // generate random Author ID too
        // create new resource
        const newResource = {
            id: uuidv4(),
            title,
            type,
            authorId: auth.slice(0,7),
            url: `http://example.com/${title.replace(/\s+/g,"")}`,
        }
        data.push(newResource); // append to the end of the array 
        await writeFile(resourcesPath, JSON.stringify(data, null, 2), "utf-8"); // save back to file
        console.log(newResource);
        res.status(201).json({ message: "Resource received", data: newResource });
    } catch {
        console.error("Error writing to file.", error);
        res.status(500).json({error: `Failed to create new resource.`});
    }
});

export default router;