var url = require("url")
  , fs = require("fs");

var Router = function(app) {
  var self = this;
  this.app = app;
  /* this is to satisfy connect's middleware API --
   * a function that returns a handler with params req, res, next */
  this.setup = function() {
    return function route(req, res, next) {
      var parsed_url, pathname, i, path, fmt, params;
      parsed_url = url.parse(req.url, true);
      pathname = parsed_url.pathname;
      i = pathname.lastIndexOf('.');
      path = (i < 0) ? pathname : pathname.substr(0, i);
      fmt = (i < 0) ? "" : pathname.substr(i+1);
      params   = parsed_url.query;
      if (self.routes[path] != undefined) {
        /* split to determine controller#action -- default to index action */
        var ca, c, a = "index";
        ca = self.routes[path].split('#');
        if (ca[0] !== '') c = ca[0];
        if (ca[1] != undefined && ca[1] !== '') a = ca[1];
        try {
          self.app.controllers[c].handle(c, a, res, params, fmt);
        } catch (err) {
          self.app.crash("Could not route -- tried { controller => \"" + c +
              "\", action => \"" + a + "\" }.", res, err);
        }
      } else if (self.routes[path + '/index'] != undefined) {
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
        fs.readFile(self.app.app_root + "/public" + pathname, function(err, data) {
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
  this.content_type = function(path) {
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
  this.load_routes = function(__app_root, __dirfile) {
    var contents;
    this.routes_filename = __app_root + __dirfile;
    contents = fs.readFileSync(this.routes_filename);
    /* load routes */
    this.routes = JSON.parse(contents);
    /* Only watch files in dev environment for performance reasons */
    if (this.app.env === "dev") {
      fs.watchFile(this.routes_filename, function(curr, prev) {
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

exports.Router = Router;
