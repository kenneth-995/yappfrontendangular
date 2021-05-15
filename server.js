const path = require('path');
const express = require('express');
const app = express();

// Serve static files
app.use(express.static(__dirname + '/dist/YAPPFRONTEND'));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/YAPPFRONTEND/index.html'));
});

// default Heroku port
console.log('hello! in port ' + process.env.PORT)
app.listen(process.env.PORT || 5000);