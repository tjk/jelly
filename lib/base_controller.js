var BaseController = function(app) {
  this.app = app;
  this.handle = function(action, res) {
    var vars = this[action](res);
    this.render(res, vars);
  };
  // don't call render from controller... call other method that calls render after processing the action
  this.render = function(res, vars, layout) {
    /* TODO -- get app's template engine and use that to 'route' to template file */
    // get the action's layout (check action, then check controller)
    var layout = layout || Jelly.layouts["app"];
    /* pass vars to some view */
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(vars);
    res.end();
  };
  this.redirect = function(res, controller_name, action_name) {
    // this may possibly be terrible
    Jelly.controllers[controller_name][action_name](res);
  };
};

exports.BaseController = BaseController;
