var url = require("url")
  , fs = require("fs");

var Router = function(app) {
  var self = this;
  this.app = app;
  /* this is to satisfy connect's middleware API --
   * a function that returns a handler with params req, res, next */
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
            if (err) app.errors._404(res, err); // throw 404
            else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              res.end();
            }
        });
      } else {
        /* No route in place -- return 404 */
        app.errors._404(res);
      }
    };
  };
  // TODO -- no need to pass these vars. we can get them from this.app
  // TODO -- change format of routes file. not json -> need something better
  this.load_routes = function load_routes(__app_root, __dirfile) {
    var contents;
    this.routes_filename = __app_root + __dirfile;
    contents = fs.readFileSync(this.routes_filename);
    this.routes = JSON.parse(contents);
    console.log("Routes loaded = " + require("util").inspect(this.routes));
    /* Only watch files in dev environment for performance reasons */
    if (this.app.dev == "env") {
      fs.watchFile(this.routes_filename, function(curr, prev) {
        if (curr.mtime > prev.mtime) {
          // file was modified, reload it
          fs.readFile(self.routes_filename, function(err, data) {
            if (err) throw err;
            self.routes = JSON.parse(data);
            // TODO -- log this differently (maybe not)
            console.log("Routes reloaded = " +
              require("util").inspect(self.routes));
          });
        }
      });
    }
  };
};

exports.Router = Router;
