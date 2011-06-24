var http = require("http");
var router = require("./config/router");

function start(port) {
  function onRequest(request, response) {
    console.log("Request received.");
    var post = "";
    request.setEncoding("utf8");
    request.addListener("data", function(chunk) {
      post += chunk;
    });
    request.addListener("end", function() {
      router.route(request, response, post);
    });
  }
  http.createServer(onRequest).listen(port);
  console.log("Server started.");
}

exports.start = start;
