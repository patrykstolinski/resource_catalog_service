import express from "express";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesPath = path.join(__dirname, "../data/resources.json");

// helper function to load any JSON data from any file
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

// GET Search resources
router.get("/search", async (req,res) => {
    try {
        const resources = await loadData(resourcesPath); // load resources
        const query = req.query; // load queries into query

        let filteredResources = resources; 

        Object.keys(query).forEach( key => { // for function that runs for each key in query
            const value = query[key];
            filteredResources = filteredResources.filter(resource => {
                return resource[key] && resource[key].toString().toLowerCase() === value.toLowerCase(); // check if key from query has anything in it, if yes, compare to the value it found
            });
        });
        res.json(filteredResources);
    } catch (error) {
        console.error("Error loading searched resource.", error);
        res.status(500).json({error: `Internal server error.`});
    }
});

// GET /resources/:id
router.get("/:id", async (req, res) => {
    try {
        const json = await loadData(resourcesPath);
        const resourceId = req.params.id;
        const resource = json.find(item => item.id === resourceId);
        if (!resource) {
            return res.status(404).json({ error: `Resource with ID "${resourceId}" not found.` });
        }
        res.json(resource);
    } catch (error) {
        console.error(`Error reading ${resourcesPath}`, error);
        res.status(500).json({ error: `Error loading ${resourcesPath}` });
    }
});


// PUT /resources/:id
router.put("/:id", async(req, res) => {
    const newData = req.body;    
    const resourceId = req.params.id; // which ID are we looking for
    
    if (!newData || Object.keys(newData).length === 0) {
        return res.status(400).json({error: "Body is empty."});
    };

    try {
        const {id, ...rest} = newData; // make sure to discard ID if PUT sends it in body
        const json = await loadData(resourcesPath); // load all the data from resources.json
        const index = json.findIndex(entry => entry.id === resourceId); // find the id in the array (if none found, it gives -1 back)
        if (index === -1) {
            return res.status(404).json({error: `Resource with ID "${resourceId}" not found.`}); // if index = -1, then throw 400
        }
        // build a new Object
        const updatedResource = {
            id: resourceId,
            ...rest
        };
        json[index] = updatedResource; // update the thing under the index with new object
        await writeFile(resourcesPath, JSON.stringify(json, null, 2), "utf-8"); // write the update in the file
        console.log(updatedResource); // log new resource
        res.status(200).json({message: `Resource with ID "${resourceId}" updated`, data: updatedResource})

    } catch (error) {
        console.error("Error updating resource:", error);
        res.status(500).json({ error: `Failed to update resource with ID ${resourceId}.`});
    }
});

// POST /resources
router.post("/", async (req, res) => {
    const newData = req.body; 

    if (!newData.title || !newData.type) {
        return res.status(400).json({error: `Missing required fields - "title" or "type".`}); 
    }; // check if title or type is missing

    try {
        const data = await loadData(resourcesPath);
        // create new resource
        const newResource = {
            id: uuidv4(),
            ...newData
        }
        // check if authorId is there, if not, generate one
        if (!newResource.authorId) {
            newResource.authorId = uuidv4().slice(0,7);
        }
        // check if url is there, if not, generate one
        if (!newResource.url) {
            newResource.url = `http://example.com/${newResource.title.replace(/\s+/g,"")}`
        }
        data.push(newResource); // append to the end of the array 
        await writeFile(resourcesPath, JSON.stringify(data, null, 2), "utf-8"); // save back to file
        console.log(newResource); // log new resource
        res.status(201).json({ message: "Resource received", data: newResource }); // send it back, along with 201
    } catch (error) {
        console.error("Error writing to file.", error);
        res.status(500).json({error: `Failed to create new resource.`});
    }
});

// DEL resource
router.delete("/:id", async (req, res) => {
    const resourceId = req.params.id; // assign the ID we look for to resourceId 

    try {
        const resources = await loadData(resourcesPath); // load resources
        const index = resources.findIndex(entry => entry.id === resourceId); // look for index in array

        if (index === -1) {
            return res.status(404).json({error: `Resource with ID "${resourceId}" was not found.`});
        }

        resources.splice(index, 1); // splice the array to remove the entry
        await writeFile(resourcesPath, JSON.stringify(resources, null, 2), "utf-8");
        console.log(`Resource with ID ${resourceId} has been deleted.`);
        res.status(204).end();

    } catch (error) {
        console.error("Error deleting the resource:", error);
        res.status(500).json({error: "Internal server error"});
    }
});

export default router;