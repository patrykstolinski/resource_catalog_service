import express from "express";

const app = express();

const port = 5002;
const localhost = "127.0.0.1";

app.get("/", (req,res) => {
    res.send("Welcome to Resource Catalog");
});


app.listen(port, () => {
    console.log(`Server listening at http://${localhost}:${port}`);

});
