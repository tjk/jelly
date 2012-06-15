var http = require("http");
var fs = require("fs");

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
    self._options = self._set_options || {};
    for (var key in self.defaults) {
      /* add defaults to self._options */
      if (self._options[key] === undefined)
        self._options[key] = self.defaults[key];
    }
    return self._options;
  })();

  self.bootstrap = function(app_root, fn, env, options) {
    /* set important stuff */
    self.app_root = app_root;
    /* what environment is application running in -- dev, prod */
    self.env = env || "dev";
    self._set_options = options;
    /* get reference to models, controllers, helpers, views */
    self.models = load_modules(self.app_root, self.options["models_dir"]);
    self.controllers = load_modules(self.app_root, self.options["controllers_dir"]);
    self.views = load_views(self.app_root, self.options["views_dir"]);
    self.layouts = load_layouts(self.app_root, self.options["layouts_dir"]);
    self.router.load_routes(self.app_root, self.options["routes_dirfile"]);
    /* set configurations based environment */
    self.debug = (self.env === "dev");
    self.bootstrapped = true;
    /* use self callback to ensure bootstrapping is done */
    if (fn) fn();
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

/* Helper for loading various modules to keep reference to */
function load_modules(__app_root, __dir) {
  return load_from_dir(__app_root + __dir, require);
}

/* Store reference to layout files to serve -- not modules to require */
function load_layouts(__app_root, __dir) {
  return load_from_dir(__app_root + __dir, fs.readFileSync);
}

/* Store reference to view files to serve -- not modules to require */
function load_views(__app_root, __dir) {
  var dir_path, controller, dirs, views = {};
  dirs = fs.readdirSync(__app_root + __dir);
  if (!dirs) return views;
  for (var i in dirs) {
    controller = dirs[i];
    dir_path = __app_root + __dir + '/' + controller;
    views[controller] = load_from_dir(dir_path, fs.readFileSync);
  }
  return views;
}

function load_from_dir(path, fn) {
  var files, key, loaded = {};
  files = fs.readdirSync(path);
  if (!files) return loaded;
  for (var i in files) {
    /* get files that start with letter */
    // TODO -- add to self test
    if (/^[a-z]/i.test(files[i]) && files[i].indexOf('.') > 0) {
      key = files[i].split('.')[0];
      loaded[key] = fn(path + '/' + files[i]);
    }
  }
  return loaded;
}

module.exports = new Jelly();
