var http = require("http")
  , url = require("url")
  , fs = require("fs")

var jails = function(app_root, env, options) {
  var self = this;
  this.version = "0.0.1";
  /* store reference to application's root */
  this.app_root = app_root;
  /* what environment is application running in -- dev, prod */
  this.env = env || "dev";
  /* default application configuration */
  this.defaults = {
      "models_dir":      "/app/models"
    , "controllers_dir": "/app/controllers"
    , "views_dir":       "/app/views"
    /* dirfile suggests it starts with '/' */
    , "routes_dirfile":  "/config/routes.json"
    , "middlewares":     []
    , "log":             true
  };
  /* store merged application configuration */
  this.options = this._options || (function() {
    self._options = options || {};
    for (var key in self.defaults) {
      /* add defaults to self._options */
      if (self._options[key] === undefined)
        self._options[key] = self.defaults[key];
    }
    return self._options;
  })();
  this.bootstrap = function(fn) {
    /* get reference to models, controllers, helpers, views */
    // TODO -- use step here to load these in parallel?
    self.models = load_modules(self.app_root, self.options["models_dir"]);
    self.controllers = load_modules(self.app_root, self.options["controllers_dir"]);
    self.views = load_modules(self.app_root, self.options["views_dir"]);
    self.routes = load_routes(self.app_root, self.options["routes_dirfile"]);
    /* add to middleware array */
    self.middlewares = self.options["middlewares"];
    /* set configurations based environment */
    self.debug = (self.env === "dev");
    /* somehow plant callbacks to reload route files, etc. when they are touched */
    // fs.watchFile(self.options["routes_file"], function(curr, prev) {});
    self.bootstrapped = true;
    if (fn) fn();
  };
  /* starts the server, pass middleware to intercept req, res, post */
  /* provide format for middleware object -- allow it to be undefined */
  this.start = function(port) {
    if (!self.bootstrapped) quit("Not Bootstrapped. Make sure to call bootstrap().");
    http.createServer(function(req, res) {
      var post = "";
      /* TODO -- make this nicer and put it in lots of places -- or find better pattern */
      for (var middleware in self.options["middlewares"]) {
        /* trigger events with trigger 3rd arg is callback to implement */
        if (middleware.enabled) middleware.trigger(req, res, reqReceived);
      }
      req.setEncoding("utf8");
      req.addListener("data", function(chunk) {
        post += chunk;
      });
      req.addListener("end", function() {
        self.route(req, res, post);
      });
    }).listen(port);
  };
  this.route = function(req, res, post) {
    // TODO -- if (self.log) -- write to access.log ?
    var pathname = url.parse(req.url).pathname;
    if (self.routes[pathname] != undefined) {
      /* split to determine controller#action */
      var ca = self.routes[pathname].split('#'), c
        , a = "index";
      if (ca[0] !== '') c = ca[0];
      if (ca[1] != undefined && ca[1] !== '') a = ca[1];
      try {
        // TODO -- remove
        console.log(require("util").inspect(self.controllers));
        self.controllers[c][a](res);
      } catch (err) {
        self.crash("Could not route -- tried { controller => " + c +
                   ", action => " + a + " }.", res, err);
      }
    } else if (["", "/", "index.html"].indexOf(pathname)) {
      // not path to index -- server public/index.html if available
      fs.readFile(self.app_root + "/public/index.html", function(err, data) {
          if (err) /* TODO -- nothing for now */; // throw 404
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          res.end();
      });
    } else {
      /* No route in place -- return 404 */
      // TODO -- move this elsewhere, pass error code, mime type, and content
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><body><h1>404 Not Found</h1>");
      if (self.debug) {
        res.write("<p>If you think this is a mistake, check your routes:</p>");
        res.write("<pre>" + require("util").inspect(self.routes).split(',').join(",\n ") + "</pre>");
      }
      res.write("</body></html>");
      res.end();
    }
  };
  this.crash = function(msg, res, err) {
    if (self.debug) {
      // TODO -- move this elsewhere, pass error code, mime type, and content
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><body><h1>500 Error: " +
          (self.debug ? msg : "Please contact a system administrator.") + "</h1>");
      if (self.debug) {
        res.write("<pre>")
        res.write(err.stack.split(" at ").join(""));
        res.write("</pre>");
      }
      res.write("</body></html>");
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
  var _module, modules = {}, filenames, key;
  filenames = fs.readdirSync(__app_root + __dir);
  if (filenames && filenames.length) {
    for (i in filenames) {
      /* get all files that start with a letter */
      if (/^[a-z]/i.test(filenames[i])) {
        key = filenames[i].split('.')[0];
        /* this seems like a decent way to decide what to load and what not to */
        if (filenames[i].indexOf('.') > 0) {
          /* require all the modules before returning them to Jails */
          _module = require(__app_root + __dir + '/' + filenames[i]);
          modules[key] = new _module();
        }
      }
    }
  }
  console.log(__dir + " -> " + require("util").inspect(modules));
  /* maintain reference to these */
  return modules;
}

function load_routes(__app_root, __dirfile) {
  var contents, routes = {};
  contents = fs.readFileSync(__app_root + __dirfile);
  routes = JSON.parse(contents);
  console.log("Routes loaded = " + require("util").inspect(routes));
  return routes;
}

function quit(msg, err) {
  console.error(msg);
  if (err) throw err;
  process.exit();
}

module.exports = jails;
