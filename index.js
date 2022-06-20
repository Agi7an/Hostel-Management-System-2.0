// nodemon index.js

const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./Routes/routes");

// MIDDLEWARE
app.use(cors())
app.use(express.json());
app.use('', routes);

app.get('*', (req, res) => {
    try {
        res.json({ "SUCCESS": ":)" });
    } catch (err) {
        res.json({ "ERROR": ":(" });
    }
});

app.listen(5000, () => {
    console.log("Server has started on port 5000");
})