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

        console.log("GitHub Response:", response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error requesting device code", details: error.response?.data || error.message });
    }
});

// Exchange code for access token
app.post("/exchange-token", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
        axios.defaults.withCredentials = true;

        const response = await axios.post("https://github.com/login/device/access_token", {
            client_id: CLIENT_ID,
            device_code: code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code"
        }, { 
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
            },
        });

        console.log("GitHub Response:", response.data);

        if (response.data.error) {
            throw new Error(response.data.error_description || response.data.error);
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error exchanging code for token:", error.response?.data || error.message);
        res.status(500).json({ error: "Error exchanging code for token", details: error.response?.data || error.message });
    }
});


app.listen(3000, () => console.log("CORS Proxy running on port 3000"));