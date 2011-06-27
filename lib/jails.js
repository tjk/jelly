var http = require("http")
  , url = require("url")
  , fs = require("fs")

var jails = function(app_root, env, options) {
  var self = this;
  self.version = "0.0.1";
  /* store reference to application's root */
  self.app_root = app_root;
  /* what environment is application running in -- dev, prod */
  self.env = env || "dev";
  /* default application configuration */
  self.defaults = {
      "models_dir":      "/app/models"
    , "controllers_dir": "/app/controllers"
    , "views_dir":       "/app/views"
    , "routes_file":     "/config/routes.json"
  };
  /* store merged application configuration */
  self.options = self._options || (function() {
    self._options = options || {};
    for (var key in self.defaults) {
      /* add defaults to self._options */
      if (self._options[key] === undefined)
        self._options[key] = self.defaults[key];
    }
    return self._options;
  })();
  self.bootstrap = function() {
    /* get reference to models, controllers, helpers, views */
    // TODO -- use step here to load these in parallel?
    self.models = load_modules(self.app_root, self.options["models_dir"]);
    self.controllers = load_modules(self.app_root, self.options["controllers_dir"]);
    self.views = load_modules(self.app_root, self.options["views_dir"]);
    self.routes = load_routes(self.app_root, self.options["routes_file"]);
    /* set configurations based on self.env */
    self.debug = (env === "dev");
    /* somehow plant callbacks to reload route files, etc. when they are touched */
    // fs.watchFile(self.options["routes_file"], function(curr, prev) {});
    self.bootstrapped = true;
  };
  /* starts the server, pass middleware to intercept req, res, post */
  /* provide format for middleware object -- allow it to be undefined */
  self.start = function(port, middleware) {
    if (!self.bootstrapped) quit("Call bootstrap first!");
    http.createServer(function(req, res) {
      var post = "";
      req.setEncoding("utf8");
      req.addListener("data", function(chunk) {
        post += chunk;
      });
      req.addListener("end", function() {
        // could allow catching request before it gets routed
        self.route(req, res, post);
      });
    }).listen(port);
  };
  self.route = function(req, res, post) {
    var pathname = url.parse(req.url).pathname;
    if (self.routes[pathname] != undefined) {
      /* split to determine controller#action */
      var ca = self.routes[pathname].split('#'), c, a;
      if (ca[0] !== '') c = ca[0];
      if (ca[1] != undefined && ca[1] !== '') a = ca[1];
      (typeof c[a] === "function") ? c[a](res) : self.crash("Could not route.", res);
    } else {
      /* No route in place -- return 404 */
      // TODO -- move this elsewhere, pass error code, mime type, and content
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("404 Not Found");
      res.end();
    }
  };
  self.crash = function(msg, res) {
    if (res && self.debug) {
      // TODO -- move this elsewhere, pass error code, mime type, and content
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("500 Error: " + msg);
      res.end();
    } else {
      console.error(msg);
      if (err) throw err;
      process.exit();
    }
  };
};

/* Helper for loading various modules to keep reference to */
function load_modules(__app_root, __dir) {
  var modules = {}, key;
  fs.readdir(__app_root + __dir, function(err, filenames) {
    if (err) quit("Error trying to load modules at " + __app_root + __dir, err);
    if (filenames && filenames.length) {
      for (filename in filenames) {
        /* get all files that start with a letter */
        if (/^[a-z]/i.test(filename)) {
          key = filename.split('.')[0];
          /* require all the modules before returning them to Jails */
          modules[key] = require(__app_root + __dir + '/' + filename);
        }
      }
    }
  });
  /* maintain reference to these */
  return modules;
}

function load_routes(__app_root, __file) {
  var routes = {};
  fs.readFile(__app_root + '/' + __file, function(err, content) {
    console.log("routes file content: " + content);
  });
  return routes;
}

function quit(msg, err) {
  console.error(msg);
  if (err) throw err;
  process.exit();
}

module.exports = jails;
