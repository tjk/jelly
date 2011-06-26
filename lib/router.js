var url = require("url")
  , controller
  , action;


exports = module.exports = router;

function router() {
  this.routes = {}; // populate this from /config/routes.js
}

router.prototype.route = function(request, response, post) {
  var pathname = url.parse(request.url).pathname;
  console.log("Trying to route " + pathname);
  // TODO - check routes[pathname] not undefined!
  if (routes[pathname] !== undefined) {
    var ca = routes[pathname].split("#");
    var c = "index", a = "index";
    if (ca[0] !== "") c = ca[0];
    if (ca[1] !== undefined && ca[1] !== "") a = ca[1];
    controller = require("./../app/controllers/" + c + "_controller");
    console.log(controller[a]);
    if (typeof controller[a] === "function") {
      // something problematic here
      controller[a](response);
    }
    else {
      throw "Action " + a + " not found in controller " + c;
    }
  }
  else {
    response.writeHead(404, {"Content-Type":"text/html"});
    response.write("404 Not Found");
    response.end();
  }
}
