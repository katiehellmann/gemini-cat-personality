// // server.js (Node.js backend)
const http = require("http");
const query = require("querystring");
const htmlHandler = require("./htmlResponses.js");
geminiHandler = require("./gemini.js");
const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || process.env.NODE_PORT || 3003;

app.use(express.static("public"));
app.use(express.json());

const urlStruct = {
  "/": htmlHandler.getIndex,
  "/style.css": htmlHandler.getCSS,
};

// Handle JSON parsing for POST requests
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

// Handle POST request to '/submit'
const handlePost = (req, res) => {
  if (req.method === "POST" && req.url === "/submit") {
    parseJsonBody(req, (error, data) => {
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

      //const personalityType = geminiHandler.runAI(data);
      //runAI(data).then((personalityType) => console.log(personalityType));

      async function fetchData(data) {
        const personalityType = await geminiHandler.runAI(data, res.api_key);

        // Respond with the personality type
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ result: personalityType }));
      }
      fetchData(data);
    });
  }
};

// a function that handles incoming requests and serves the correct content
const onRequest = (request, response) => {
  // determine if the request is using HTTP or HTTPS
  const protocol = request.connection.encrypted ? "https" : "http";
  const parsedUrl = new URL(
    request.url,
    `${protocol}://${request.headers.host}`
  );

  if (request.method === "POST") {
    return handlePost(request, response);
  }

  // if the requested path exists, call its handler
  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }
};

// create and start the server
http.createServer(onRequest).listen(PORT, () => {
  console.log(`Server running on:${PORT}`);
});
