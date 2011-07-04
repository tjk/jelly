var url = require("url")
  , fs = require("fs");

var Router = function(app) {
  var self = this;
  this.app = app;
  this.setup = function() {
    return function route(req, res, next) {
      if (app.log) log_access(req);
      var pathname = url.parse(req.url).pathname;
      if (self.routes[pathname] != undefined) {
        /* split to determine controller#action */
        var ca = self.routes[pathname].split('#'), c, a = "index";
        if (ca[0] !== '') c = ca[0];
        if (ca[1] != undefined && ca[1] !== '') a = ca[1];
        try {
          app.controllers[c].handle(c, a, res);
        } catch (err) {
          app.crash("Could not route -- tried { controller => " + c +
                     ", action => " + a + " }.", res, err);
        }
      } else if (["/", "/index.htm", "/index.html"].indexOf(pathname) >= 0) {
        // not path to index -- server public/index.html if available
        fs.readFile(app.app_root + "/public/index.html", function(err, data) {
            if (err) /* TODO -- nothing for now */; // throw 404
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            res.end();
        });
      } else {
        /* No route in place -- return 404 */
        app.errors._404(res);
      }
    };
  };
  // TODO -- do we need to pass these vars. we can get from app...
  this.load_routes = function load_routes(__app_root, __dirfile) {
    var contents;
    this.routes_filename = __app_root + __dirfile;
    contents = fs.readFileSync(this.routes_filename);
    this.routes = JSON.parse(contents);
    console.log("Routes loaded = " + require("util").inspect(this.routes));
    fs.watchFile(this.routes_filename, function(curr, prev) {
      if (curr.mtime > prev.mtime) {
        // file was modified, reload it
        fs.readFile(self.routes_filename, function(err, data) {
          if (err) throw err;
          self.routes = JSON.parse(data);
          console.log("Routes updated!");
        });
      }
    });
  };
};

// TODO -- move this elsewhere and implement
// logger.js?
function log_access(req) {
  var path = "";
  //console.log(req.socket.remoteAddress);
  //console.log(req.headers["user-agent"]);
  //console.log(req.url);
  //console.log(req.method);
}

exports.Router = Router;
