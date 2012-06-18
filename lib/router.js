var url = require("url");
var fs = require("fs");

exports.Router = function(app) {
  var self = this;
  self.app = app;

  /* self is to satisfy connect's middleware API --
   * a function that returns a handler with params req, res, next */
  self.setup = function() {
    return function route(req, res, next) {
      var parsed_url = url.parse(req.url, true);
      var pathname = parsed_url.pathname;
      var i = pathname.lastIndexOf('.');
      var path = (i < 0) ? pathname : pathname.substr(0, i);
      var fmt = (i < 0) ? "" : pathname.substr(i+1);
      var params = parsed_url.query;

      if (typeof self.routes[path] !== "undefined") {
        /* split to determine controller#action -- default to index action */
        var ca, c, a = "index";
        ca = self.routes[path].split('#');
        if (ca[0] !== '') c = ca[0];
        if (typeof ca[1] !== "undefined" && ca[1] !== '') a = ca[1];
        try {
          self.app.controllers[c].handle(c, a, res, params, fmt);
        } catch (err) {
          // TODO this may need a bit more help
          self.app.crash("Could not route -- tried { controller => \"" + c +
              "\", action => \"" + a + "\" }.", res, err);
        }
      } else if (typeof self.routes[path + '/index'] != "undefined") {
        /* try index action by default */
        c = path.substring(1);
        try {
          self.app.controllers[c].handle(c, "index", res, params, fmt);
        } catch (err) {
          self.app.crash("Could not route -- tried { controller => \"" + c +
              "\", action => \"index\" }.", res, err);
        }
      } else {
        /* check if we can serve it from the public dir */
        if (pathname === '/') pathname = "/index.html";
        fs.readFile(self.app.root + "/public" + pathname, function(err, data) {
          if (err) app.errors._404(res, err); // throw 404
          else {
            res.writeHead(200, { "Content-Type": self.content_type(pathname) });
            res.write(data);
            res.end();
          }
        });
      }
    };
  };

  self.content_type = function(path) {
    /* path to supported Content-Type */
    var i = path.lastIndexOf('.')
      , ext = (i < 0) ? "" : path.substr(i+1)
      /* add to these */
      , extensions = {
          "css"  : "text/css"
        , "csv"  : "text/csv"
        , "htm"  : "text/html"
        , "html" : "text/html"
        , "gif"  : "image/gif"
        , "jpeg" : "image/jpeg"
        , "jpg"  : "image/jpeg"
        , "js"   : "application/javascript"
        , "txt"  : "text/plain"
        , "yaml" : "text/yaml"
        , "yml"  : "text/yaml"
      };
    return extensions[ext];
  };

  // TODO -- change format of routes file. not json -> need some *real* js :)
  self.load_routes = function(routes_dirfile) {
    var contents;
    self.routes_filename = self.app.root + routes_dirfile;
    contents = fs.readFileSync(self.routes_filename);
    /* load routes */
    self.routes = JSON.parse(contents);
    /* Only watch files in dev environment for performance reasons */
    if (self.app.env === "dev") {
      fs.watchFile(self.routes_filename, function(curr, prev) {
        if (curr.mtime > prev.mtime) {
          /* file was modified, reload it */
          fs.readFile(self.routes_filename, function(err, data) {
            if (err) throw err;
            /* reload routes */
            self.routes = JSON.parse(data);
          });
        }
      });
    }
  };
};
