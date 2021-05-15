const path = require('path');
const express = require('express');
const app = express();

// Serve static files
app.use(express.static(__dirname + '/dist/yappfrontend'));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/yappfrontend/index.html'));
});

// default Heroku port
console.log('hello! in PORT ' + process.env.PORT)
console.log('hello! in PATH ' + path.__dirname)
app.listen(process.env.PORT || 5000);