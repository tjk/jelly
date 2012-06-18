var http = require("http");

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

  /* load all classes in active_support */
  // TODO move this
  require("./active_support/string");

  /* set global templating and datastore defaults */
  self.templating = new (require("./components/templating/html").Html)(self);
  self.datastore = new (require("./components/datastore/memory").Memory)(self);

  /* get loader object */
  self.loader = new (require("./loader").Loader)(self);

  self.bootstrap = function(root, fn, env, options) {
    /* set important stuff */
    self.root = root;
    /* what environment is application running in -- dev, prod */
    self.env = (env || "dev");
    self._set_options = options;
    /* get reference to models, controllers, helpers, views */
    self.models = self.loader.load_models();
    self.controllers = self.loader.load_controllers();
    self.views = self.loader.load_views();
    self.layouts = self.loader.load_layouts();
    /* load the routes */
    self.router.load_routes(self.options["routes_dirfile"]);
    /* set configurations based environment */
    self.debug = (self.env === "dev");
    self.bootstrapped = true;
    /* use self callback to ensure bootstrapping is done */
    if (fn) fn();
  };

  /* Main connected components */
  self.active_record = new (require("./active_record").ActiveRecord)(self);
  self.application_controller = require("./application_controller").ApplicationController;
  self.router = new (require("./router").Router)(self);
  self.errors = new (require("./errors").Errors)(self);
  self.crash = function(msg, res, err) {
    self.errors._500(res, msg, err);
  };
};

module.exports = new Jelly();
