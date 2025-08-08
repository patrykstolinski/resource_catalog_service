import express from "express";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';
import { validateResource } from "../middleware/validation.js";
import { loadData, writeData } from "../helpers/data_manager.js";



const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths to external data
const resourcesPath = path.join(__dirname, "../data/resources.json");
const ratingsPath = path.join(__dirname, "../data/ratings.json");
const feedbackPath = path.join(__dirname,"../data/feedback.json");

// helper function to load any JSON data from any file
// async function loadData(data) {
//     const file_data = await readFile(data, "utf-8");
//     return JSON.parse(file_data);
// };

// GET /resources
router.get("/", async (req, res, next) => {
    try {
        const json = await loadData(resourcesPath);
        res.json(json);
    } catch (error) {
        console.error(`Error reading ${resourcesPath}`, error);
        // res.status(500).json({ error: `Error loading ${resourcesPath}` });
        next(error);
    }
});

// GET Search resources
router.get("/search", async (req,res, next) => {
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
        // res.status(500).json({error: `Internal server error.`});
        next(error);
    }
});

// GET /resources/:id (with rating)
router.get("/:id", async (req, res, next) => {
    try {
        const json = await loadData(resourcesPath);
        const resourceId = req.params.id;
        const resource = json.find(item => item.id === resourceId);
        if (!resource) {
            return res.status(404).json({ error: `Resource with ID "${resourceId}" not found.` });
        }
        // load ratings
        const ratings = await loadData(ratingsPath);
        // filter ratings based on ID
        const relevantRating = ratings.filter( r => r.resourceId === resourceId);
        let averageRating = null;
        // if there are any ratings, calculate them
        if (relevantRating.length > 0) {
            let totalRating = 0;
            // for each rating, add each rating
            relevantRating.forEach(rating => {
                totalRating += rating.ratingValue;
            });
            // round it
            averageRating = Math.round((totalRating / relevantRating.length) * 100)/100;
        }
        resource.averageRating = averageRating; // add rating to object for GET
        res.json(resource);
    } catch (error) {
        console.error(`Error reading ${resourcesPath}`, error);
        // res.status(500).json({ error: `Error loading ${resourcesPath}` });
        next(error);
    }
});

// POST /resources
router.post("/", validateResource , async (req, res, next) => {
    const newData = req.body; 

    try {
        const data = await loadData(resourcesPath);
        // create new resource
        const newResource = {
            id: uuidv4().slice(0,5),
            ...newData
        }
        // check if authorId is there, if not, generate one
        if (!newResource.authorId) {
            newResource.authorId = uuidv4().slice(0,5);
        }
        // check if url is there, if not, generate one
        if (!newResource.url) {
            newResource.url = `http://example.com/${newResource.title.replace(/\s+/g,"")}`
        }
        data.push(newResource); // append to the end of the array 
        await writeData(resourcesPath, data )
        console.log(newResource); // log new resource
        res.status(201).json({ message: "Resource received", data: newResource }); // send it back, along with 201
    } catch (error) {
        console.error("Error writing to file.", error);
        // res.status(500).json({error: `Failed to create new resource.`});
        next(error);
    }
});

// /POST rating 
router.post("/:id/rating", async (req, res, next) => {
    const resourceId = req.params.id;
    const {ratingValue, userId} = req.body;
    // validate the ratingValue (integer, between 1-5)
    if (ratingValue === undefined || !ratingValue) {
        return res.status(400).json({error: "Missing Rating value in request body."});
    }
    if (!Number.isInteger(ratingValue) || ratingValue < 1 ||  ratingValue > 5 ){
        return res.status(400).json({error: "Rating Value must be an integer between 1 and 5."});
    }
    
  try {
    // Load existing ratings, or start with empty array if no file yet
    let ratings = [];
    try {
      ratings = await loadData(ratingsPath);
    } catch (err) {
      if (err.code !== "ENOENT") throw err; // if error is NOT file-not-found, throw
      // else ignore, file not found means no ratings yet
    }
    // Create new rating object
    const newRating = {
        id: uuidv4().slice(0,5),
        resourceId,
        ratingValue,
        userId: userId || "anonymous",
        timestamp: `[${new Date().toLocaleString("de-DE")}]`,
    };
    // Append new rating and write back
    ratings.push(newRating);
    await writeData(ratingsPath, ratings);

    res.status(201).json({ message: "Rating saved", data: newRating });
  } catch (error) {
    next(error);
  }
});

// PUT /resources/:id
router.put("/:id", async(req, res, next) => {
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
            ...json[index],
            ...rest,
            id: resourceId
        };
        json[index] = updatedResource; // update the thing under the index with new object
        await writeData(resourcesPath, json);
        console.log(updatedResource); // log new resource
        res.status(200).json({message: `Resource with ID "${resourceId}" updated`, data: updatedResource})

    } catch (error) {
        console.error("Error updating resource:", error);
        // res.status(500).json({ error: `Failed to update resource with ID ${resourceId}.`});
        next(error);
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
        await writeData(resourcesPath, resources);
        console.log(`Resource with ID ${resourceId} has been deleted.`);
        res.status(204).end();

    } catch (error) {
        console.error("Error deleting the resource:", error);
        // res.status(500).json({error: "Internal server error"});
        next(error);
    }
});

// ----------- FEEDBACK THINGS 
// add feedback to resource ID
router.post("/:resourceId/feedback", async(req,res,next)=> {
    const resourceId = req.params.resourceId;
    const { feedbackText, userId} = req.body;
    // check if resourceId came through
    if (!resourceId){
        return res.status(400).json({error: "Missing resourceId in URL."});
    }
    // check the type and length
    if (typeof feedbackText !== "string" || feedbackText.trim().length < 10 || feedbackText.trim().length > 500) {
        return res.status(400).json({error: "Feedback must be a string between 10 and 500 characters."});
    }
    try {
        // load the feedback file
        const feedbackList = await loadData(feedbackPath);
        // create new feedback from request
        const newFeedback = {
            id: uuidv4().slice(0,5),
            resourceId,
            feedbackText: feedbackText.trim(),
            userId: userId || "anonymous",
            timestamp: `[${new Date().toLocaleString("de-DE")}]`,
        }
        // add feedback object to the array
        feedbackList.push(newFeedback);
        // write feedback to file
        writeData(feedbackPath, feedbackList);
        res.status(201).json({message: `Feedback received`, feedback: newFeedback})
    } catch (error) {
        next(error);
    }

});
// Change feedback
router.put("/:resourceId/feedback/:feedbackId", async (req,res,next) => {
    const { resourceId, feedbackId} = req.params;
    const { feedbackText, userId } = req.body;

    // validate if everything is there
    if (!resourceId || !feedbackId || !userId) {   
        return res.status(400).json({error: "Missing resourceId, feedbackId or userId in URL."})
    }
    // validate feedback Text
    if (typeof feedbackText !== "string" || feedbackText.trim().length < 10 || feedbackText.trim().length > 500) {
        return res.status(400).json({error: "Feedback must be a string between 10 and 500 characters."});
    }

    try {
        const feedbackList = await loadData(feedbackPath);
        // find index that has the same ID for feedback/resource/user
        const index = feedbackList.findIndex(fb => fb.id === feedbackId && fb.resourceId === resourceId && fb.userId === userId);
        if (index === -1) {
            return res.status(404).json({error: "Feedback not found."});
        }
        // change the feedback and timestamp
        feedbackList[index].feedbackText = feedbackText.trim();
        feedbackList[index].timestamp = `[${new Date().toLocaleString("de-DE")}]`;
        // write to file
        await writeData(feedbackPath, feedbackList);
        res.status(200).json({message: "Feedback updated.", feedback: feedbackList[index]});

    } catch (error) {
        next(error);
    }
});
// delete Feedback
router.delete("/:resourceId/feedback/:feedbackId", async (req,res,next) => {

    const { resourceId, feedbackId} = req.params;
    const { userId } = req.body;

    if (!userId) {
        res.status(400).json({error: "Deleting feedback requires userId."})
    }

    try {
        const feedbackList = await loadData(feedbackPath);
        // look for index with corresponding feedbackId and userId
        const index = feedbackList.findIndex(fb => fb.id === feedbackId)
        // validate if index is found
        if (index === -1) {
            return res.status(404).json({error: "Feedback not found."});
        }
        // validate if its the same user
        if (feedbackList[index].userId !== userId ) {
            return res.status(403).json({error: "User not authorized."})
        }
        // cut out the feedback
        feedbackList.splice(index, 1);
        // write everything back to file
        // await writeFile(feedbackPath, JSON.stringify(feedbackList, null, 2), "utf-8");
        await writeData(feedbackPath, feedbackList)
        res.status(204).end();

    } catch (error) {
        next(error)
    }
});

export default router;