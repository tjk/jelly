var http = require("http")
  , router = require("./router");

exports.version = "0.0.1";
exports.create_server = create_server;
exports.router = router;

var app = http.createServer(on_request);
app.__proto__ = http.Server.prototype;

app.routes = function(json_file) {
  console.log("trying to load routes from " + json_file)
};

function create_server() {
  return app;
}

function on_request(request, response) {
  var post = "";
  request.setEncoding("utf8");
  request.addListener("data", function(chunk) {
    post += chunk;
  });
  request.addListener("end", function() {
    // could allow catching request before it gets routed
    router.route(request, response, post);
  });
}
