var http = require("http")
  , fs = require("fs");

var Jelly = function() {
  var self = this;
  /* may move this out -- but have version info in jelly object */
  this.version = "0.0.1";
  /* default application configuration */
  this.defaults = {
      "templating":      "jade"
    /* module directories */
    , "models_dir":      "/app/models"
    , "controllers_dir": "/app/controllers"
    , "views_dir":       "/app/views"
    , "layouts_dir":     "/app/views/layouts"
    /* dirfile suggests it starts with '/' */
    , "routes_dirfile":  "/config/routes.json"
    , "middlewares":     []
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
    // TODO -- use step here to load these in parallel?
    // format -- this.models["post"] = [".../post.js", module]
    this.models = load_modules(this.app_root, this.options["models_dir"]);
    this.controllers = load_modules(this.app_root, this.options["controllers_dir"]);
    this.views = load_templates(this.app_root, this.options["views_dir"]);
    this.layouts = load_templates(this.app_root, this.options["layouts_dir"]);
    this.router.load_routes(this.app_root, this.options["routes_dirfile"]);
    /* add to middleware array */
    this.middlewares = this.options["middlewares"];
    /* set configurations based environment */
    this.debug = (this.env === "dev");
    this.bootstrapped = true;
    /* use this callback to call start -- to ensure bootstrapping is done */
    if (fn) fn();
  };
  /* Main connected modules */
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
  var modules = {}, filenames, key;
  filenames = fs.readdirSync(__app_root + __dir);
  if (filenames && filenames.length) {
    for (i in filenames) {
      /* get all files that start with a letter */
      if (/^[a-z]/i.test(filenames[i])) {
        key = filenames[i].split('.')[0];
        /* this seems like a decent way to decide what to load and what not to */
        if (filenames[i].indexOf('.') > 0) {
          /* require all the modules before returning them to Jelly */
          modules[key] = require(__app_root + __dir + '/' + filenames[i]);
          console.log(require('util').inspect(modules[key]) + " filename: " + filenames[i]);
        }
      }
    }
  }
  console.log(__dir + " -> " + require("util").inspect(modules));
  /* maintain reference to these */
  return modules;
}

/* Store reference to template files to serve -- not modules to require */
function load_templates(__app_root, __dir) {
  var content = {}, filenames, key;
  filenames = fs.readdirSync(__app_root + __dir);
  if (filenames && filenames.length) {
    for (i in filenames) {
      /* get all files that start with a letter */
      if (/^[a-z]/i.test(filenames[i])) {
        key = filenames[i].split('.')[0];
        /* this seems like a decent way */
        if (filenames[i].indexOf('.') > 0) {
          /* could too big of templates mess this up? */
          content[key] = fs.readFileSync(__app_root + __dir + '/' + filenames[i]);
        }
      }
    }
  }
  console.log(__dir + " -> " + require("util").inspect(content));
  /* maintain reference to templates */
  return content;
}

function quit(msg, err) {
  console.error(msg);
  if (err) throw err;
  process.exit();
}

module.exports = new Jelly();
