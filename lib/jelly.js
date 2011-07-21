var http = require("http")
  , fs = require("fs");

var Jelly = function() {
  var self = this;
  /* may move this out -- but have version info in jelly object */
  this.version = "0.0.3";
  /* default application configuration */
  this.defaults = {
      "templating":      "jade"
    /* module directories */
    , "models_dir":      "/app/models"
    , "controllers_dir": "/app/controllers"
    , "views_dir":       "/app/views"
    , "layouts_dir":     "/app/views/layouts"
    /* dirfile suggests it starts with '/' */
    , "routes_dirfile":  "/config/routes.json" // TODO -- make this routes.js ??
    , "log":             true
  };
  /* store merged application configuration */
  this.options = this._options || (function() {
    self._options = self._set_options || {};
    for (var key in self.defaults) {
      /* add defaults to this._options */
      if (self._options[key] === undefined)
        self._options[key] = self.defaults[key];
    }
    return self._options;
  })();
  this.bootstrap = function(app_root, fn, env, options) {
    /* set important stuff */
    this.app_root = app_root;
    /* what environment is application running in -- dev, prod */
    this.env = env || "dev";
    this._set_options = options;
    /* get reference to models, controllers, helpers, views */
    this.models = load_modules(this.app_root, this.options["models_dir"]);
    this.controllers = load_modules(this.app_root, this.options["controllers_dir"]);
    this.views = load_views(this.app_root, this.options["views_dir"]);
    this.layouts = load_layouts(this.app_root, this.options["layouts_dir"]);
    this.router.load_routes(this.app_root, this.options["routes_dirfile"]);
    /* set configurations based environment */
    this.debug = (this.env === "dev");
    this.bootstrapped = true;
    /* use this callback to ensure bootstrapping is done */
    if (fn) fn();
  };
  /* Main connected components */
  this.active_record = new (require("./active_record").ActiveRecord)(this);
  this.base_controller = new (require("./base_controller").BaseController)(this);
  this.router = new (require("./router").Router)(this);
  this.errors = new (require("./errors").Errors)(this);
  this.crash = function(msg, res, err) {
    this.errors._500(res, msg, err);
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
    // TODO -- add to this test
    if (/^[a-z]/i.test(files[i]) && files[i].indexOf('.') > 0) {
      key = files[i].split('.')[0];
      loaded[key] = fn(path + '/' + files[i]);
    }
  }
  return loaded;
}

module.exports = new Jelly();
