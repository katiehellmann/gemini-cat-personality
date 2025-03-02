const http = require("http");
const query = require("querystring");
const htmlHandler = require("./htmlResponses.js");
const geminiHandler = require("./gemini.mjs");
const express = require("express");
const path = require("path");
const app = express();
const fs = require('fs');


const PORT = process.env.PORT || process.env.NODE_PORT || 3003;

app.use(express.static("public"));
app.use(express.json());

const urlStruct = {
  "/": htmlHandler.getIndex,
  "/style.css": htmlHandler.getCSS,
};

const parseJsonBody = (req, callback) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const parsedData = JSON.parse(body);
      callback(null, parsedData);
    } catch (error) {
      callback(error, null);
    }
  });
};

const determineImage = (personalityType) => {
  // Extract the first part of the personality string before the exclamation mark
  const match = personalityType.match(/^You are a (.*?)!/);
  const extractedType = match ? match[1].trim() : "";

  console.log("Extracted Personality Type:", extractedType); // Debugging

  const imageMap = {
    "Dismissive Diva": "/images/diva.png",
    "**Dismissive Diva**": "/images/diva.png",
    "Trouble Maker": "/images/troublemaker.png",
    "**Trouble Maker**": "/images/troublemaker.png",
    "Snacker": "/images/snack.png",
    "**Snacker**": "/images/snack.png",
    "Window Watcher": "/images/window.png",
    "**Window Watcher*": "/images/window.png",
    "Backyard Wanderer": "/images/wander.png",
    "**Backyard Wanderer**": "/images/wander.png",
  };
  console.log(imageMap[extractedType]);
  return imageMap[extractedType] || "/images/wander.png";
};


const handlePost = (req, res) => {
  if (req.method === "POST" && req.url === "/submit") {
    parseJsonBody(req, async (error, data) => {
      if (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON format." }));
      }

      const { answers } = data;
      console.log(answers);
      if (!answers || answers.length < 6) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Please answer all questions." })
        );
      }
      let personalityType = "";
      async function fetchData(data) {
        personalityType = await geminiHandler.runAI(data, res.api_key);
        console.log(personalityType);
        const imageUrl = await determineImage(personalityType);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result: personalityType, imageUrl }));
      }
      fetchData(data);

    });
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? "https" : "http";
  const parsedUrl = new URL(
    request.url,
    `${protocol}://${request.headers.host}`
  );

  if (request.method === "POST") {
    return handlePost(request, response);
  }

  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }

  if (parsedUrl.pathname.startsWith("/images/")) {
    const filePath = path.join(__dirname, "public", parsedUrl.pathname);
    response.writeHead(200, { "Content-Type": "image/png" });
    return fs.createReadStream(filePath).pipe(response);
  }
};

http.createServer(onRequest).listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
