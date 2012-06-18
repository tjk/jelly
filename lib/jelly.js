var http = require("http");
var fs = require("fs");

// TODO loader class to extract many of the load methods

var Jelly = function() {
  var self = this;

  /* may move self out -- but have version info in jelly object */
  self.version = "0.0.1";

  /* default application configuration */
  self.defaults = {
      /* module directories */
      "models_dir":      "/app/models"
    , "controllers_dir": "/app/controllers"
    , "views_dir":       "/app/views"
    , "layouts_dir":     "/app/views/layouts"
      /* dirfile suggests it starts with '/' */
    , "routes_dirfile":  "/config/routes.json" // TODO -- make self routes.js ??
    , "log":             true
  };

  /* store merged application configuration */
  self.options = self._options || (function() {
    self._options = {};
    for (var key in self.defaults) {
      /* add defaults to self._options */
      if (typeof self._options[key] === "undefined")
        self._options[key] = self.defaults[key];
    }
    return self._options;
  })();

  /* set global templating and datastore defaults */
  self.templating = new (require("./templating/html").Html)(self);
  self.datastore = new (require("./datastore/memory").Memory)(self);

  self.bootstrap = function(app_root, fn, env, options) {
    /* set important stuff */
    self.app_root = app_root;
    /* what environment is application running in -- dev, prod */
    self.env = env || "dev";
    self._set_options = options;
    /* get reference to models, controllers, helpers, views */
    self.models = self.load_modules(self.app_root, self.options["models_dir"]);
    self.controllers = self.load_modules(self.app_root, self.options["controllers_dir"]);
    // TODO make others more like load_views
    self.load_views(self.app_root, self.options["views_dir"]);
    self.load_layouts(self.app_root, self.options["layouts_dir"]);
    self.router.load_routes(self.app_root, self.options["routes_dirfile"]);
    /* set configurations based environment */
    self.debug = self.live_update = (self.env === "dev");
    self.bootstrapped = true;
    /* use self callback to ensure bootstrapping is done */
    if (fn) fn();
  };

  /* Store reference to view files to serve -- not modules to require */
  self.load_views = function(__app_root, __dir) {
    self.views = {};
    var dirs = fs.readdirSync(__app_root + __dir);
    if (!dirs)
      self.views = views;
    var dir_path, controller;
    for (var i in dirs) {
      controller = dirs[i];
      dir_path = __app_root + __dir + '/' + controller;
      self.views[controller] = self.load_from_dir(dir_path, fs.readFileSync,
          function(path) {
            return self.live_update && path.match(self.templating.extension);
      });
    }
  };

  /* Helper for loading various modules to keep reference to */
  self.load_modules = function(__app_root, __dir) {
    return self.load_from_dir(__app_root + __dir, require);
  }

  /* Store reference to layout files to serve -- not modules to require */
  self.load_layouts = function(__app_root, __dir) {
    self.layouts = self.load_from_dir(__app_root + __dir, fs.readFileSync);
  }

  /* TODO make live_update work on WINDOWS */

  self.subprocess_crash = function() {
    console.error("CRASH OCCURED!");
  };

  self.live_update_crash = function(old_stat, new_stat) {
    if (new_stat.mtime.getTime() !== old_stat.mtime.getTime())
      self.subprocess_crash();
  };

  self.load_from_dir = function(path, fn, live_update_guard) {
    var files = fs.readdirSync(path), loaded = {};
    if (!files)
      return loaded;
    var key, fpath;
    for (var i in files) {
      /* get files that start with letter */
      // TODO -- add to self test
      if (/^[a-z]/i.test(files[i]) && files[i].indexOf('.') > 0) {
        key = files[i].split('.')[0];
        fpath = path + "/" + files[i];
        loaded[key] = fn(fpath);
        if (typeof live_update_guard !== "undefined" && live_update_guard(fpath))
          fs.watchFile(fpath, { persistent: true, interval: 100 }, self.live_update_crash);
      }
    }
    return loaded;
  }

  // TODO maybe use supervisor instead?
  self.live_update = function(path, pattern, fn) {
    fs.stat(path, function(err, stat) {
      if (err) {
        util.error("could not stat " + path);
      } else if (stat.isDirectory()) {
        // recurse
        fs.readdir(path, function(err, files) {
          if (err) {
            util.error("could not read " + path);
          } else {
            files.forEach(function(file) {
              self.live_update(path + "/" + file, pattern, fn);
            });
          }
        });
      } else if (path.match(pattern)) {
        fn(path);
      }
    });
  };

  /* Main connected components */
  self.active_record = new (require("./active_record").ActiveRecord)(self);
  self.base_controller = new (require("./base_controller").BaseController)(self);
  self.router = new (require("./router").Router)(self);
  self.errors = new (require("./errors").Errors)(self);
  self.crash = function(msg, res, err) {
    self.errors._500(res, msg, err);
  };
};

module.exports = new Jelly();
