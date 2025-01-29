// server.js - GitHub OAuth CORS Proxy
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = "Ov23liQtoXTUMiE8nnxf";
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Request device code from GitHub
app.post("/get-device-code", async (req, res) => {
    try {
        const response = await axios.post("https://github.com/login/device/code", {
            client_id: CLIENT_ID,
            scope: "repo user",
        }, { headers: { "Accept": "application/json" } });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error requesting device code", details: error.response?.data || error.message });
    }
});

// Exchange code for access token
app.post("/exchange-token", async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
        }, { headers: { "Accept": "application/json" } });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error exchanging code for token", details: error.response?.data || error.message });
    }
});

app.listen(3000, () => console.log("CORS Proxy running on port 3000"));