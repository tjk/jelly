var path = require("path");

var BaseController = function(app) {
  this.app = app;
  this.handle = function(controller_name, action, res) {
    // TODO -- get vars from action
    var vars = this[action](res);
    this.render(res, controller_name, action, vars);
  };
  // TODO -- move this to views.js
  this.render = function(res, controller_name, action, vars, layout) {
    // TODO -- for layout: check action, then check controller
    var layout = layout || "app";
    var vars = vars || {};
    /* pass vars to some view */
    switch (app.options["templating"]) {
      case "jade":
        // TODO -- abstract out everything below to make it nice
        // and reusable for other templating engines -- emphasis on NICE
        // TODO -- use templates which have been loaded in this.app.views[...]
        var jade = require("jade")
          , layout_filename = app.app_root +
              app.options["layouts_dir"] + '/' + layout + ".jade"
          , view_filename = app.app_root +
              app.options["views_dir"] + '/' + controller_name +
              '/' + action + ".jade";
        try {
          jade.renderFile(view_filename, {locals: vars}, function(view_err, view_html) {
            if (view_err) app.crash("Jade rendering view failed.", res, view_err);
            else {
              vars.yield = view_html;
              console.log(vars)
              try {
                jade.renderFile(layout_filename, {locals:vars}, function(layout_err, layout_html) {
                  if (layout_err) app.crash("Jade rendering layout failed.", res, layout_err);
                  else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(layout_html);
                    res.end();
                  }
                });
              } catch (err) {
                app.crash("Jade layout file for layout " + layout +
                  " not found at " + layout_filename + ").", res, err);
              }
            }
          });
        } catch (err) {
          app.crash("Jade viewfile for " + controller_name +
            "#" + action + " not found at " +
            view_filename + ").", res);
        }
        break;
      default:
        console.log("Unsupported templating engine specified.");
    }
  };
  this.redirect = function(res, controller_name, action_name) {
    // TODO -- this may possibly be terrible
    app.controllers[controller_name][action_name](res);
  };
};

exports.BaseController = BaseController;
