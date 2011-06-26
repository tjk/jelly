var http = require("http")
  , router = require("./router");

exports.version = "0.0.1";
exports.create_server = create_server;
exports.router = router;

function create_server() {
  return http.createServer(on_request);
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
