import express from "express";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesPath = path.join(__dirname, "../data/resources.json");

async function loadData(data) {
    const file_data = await readFile(data, "utf-8");
    return JSON.parse(file_data);
}

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
router.post("/", (req, res) => {
    console.log("POST", req.body);
    res.status(201).json({ message: "Resource received", data: req.body });
});

export default router;