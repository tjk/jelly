var fs = require("fs");

exports.Loader = function(app) {
  var self = this;
  self.app = app;

  self.live_update = (self.app.env == "dev");

  self.models_dir = self.app.options["models_dir"];
  self.controllers_dir = self.app.options["controllers_dir"];
  self.views_dir = self.app.options["views_dir"];
  self.layouts_dir = self.app.options["layouts_dir"];

  self.routes_file = self.app.options["routes_dirfile"];

  self.load_models = function() {
    return self.load_modules(self.models_dir);
  };

  self.load_controllers = function() {
    return self.load_modules(self.controllers_dir);
  };

  /* Store reference to view files to serve -- not modules to require */
  self.load_views = function() {
    var views = {};
    var views_path = self.app.root + self.views_dir;
    var dirs = fs.readdirSync(views_path);
    if (!dirs)
      return views;
    var dir_path, controller;
    for (var i in dirs) {
      controller = dirs[i];
      if (controller === "layouts")
        continue;
      dir_path = views_path + '/' + controller;
      views[controller] = self.load_from_dir(dir_path,
          fs.readFileSync,
          function(path) {
            return self.live_update &&
                path.match(self.app.templating.extension);
      });
    }
    return views;
  };

  /* Store reference to layout files to serve -- not modules to require */
  self.load_layouts = function() {
    return self.load_from_dir(self.app.root + self.layouts_dir,
        fs.readFileSync);
  }

  /* Helper for loading various modules to keep reference to */
  self.load_modules = function(dir) {
    return self.load_from_dir(self.app.root + dir, require);
  }

  self.load_from_dir = function(path, fn, live_update_guard) {
    var files = fs.readdirSync(path), loaded = {};
    if (!files)
      return loaded;
    var key, fpath;
    for (var i in files) {
      /* get files that start with letter */
      // TODO -- add to self test
      if (/^[a-z]/i.test(files[i]) && files[i].indexOf('.') > 0) {
        key = files[i].split('.')[0].replace(/_controller$/g, ""); // TODO check this?
        fpath = path + "/" + files[i];
        loaded[key] = fn(fpath);
        if (typeof live_update_guard !== "undefined" &&
            live_update_guard(fpath))
          fs.watchFile(fpath, { persistent: true, interval: 100 },
              self.live_update_crash);
      }
    }
    return loaded;
  }

  /* TODO make live_update work on WINDOWS */
  // TODO maybe use supervisor instead?

  self.crash = function() {
    console.error("CRASH OCCURED!");
  };

  self.live_update_crash = function(old_stat, new_stat) {
    if (new_stat.mtime.getTime() !== old_stat.mtime.getTime())
      self.crash();
  };

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
};
