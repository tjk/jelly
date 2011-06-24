var server = require("./server");

console.log("Starting server from root directory " + __dirname);
server.start(8080);
