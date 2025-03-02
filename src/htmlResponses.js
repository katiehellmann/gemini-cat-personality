const fs = require('fs');

const INDEX = fs.readFileSync(`${__dirname}/../client/client.html`);
const CSS = fs.readFileSync(`${__dirname}/../client/output.css`);

// a function to serve the index webpage
const getIndex = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(INDEX);
  res.end();
};

// a fucntion to serve the css styles
const getCSS = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(CSS);
  res.end();
};

// export
module.exports = {
  getIndex,
  getCSS,
};