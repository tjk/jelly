var jade = require("jade");

exports.Jade = function(app) {
  var self = this;
  self.app = app;

  self.extension = ".html.jade";

  // TODO get the layout from controller + action
  self.render = function(controller, action, layout, vars, res) {
    var html = "";
    try {
      var view_html = jade.render(self.app.views[controller][action],
          { locals: vars });
      vars.yield = view_html;
      try {
        html = jade.render(self.app.layouts[layout], { locals: vars });
      } catch (err) {
        var locals = "";
        for (var i in vars) {
          if (i !== "__")
            locals += " " + i;
        }
        self.app.crash("Jade rendering layout failed -- locals set: " + locals +
            ".", res, err);
      }
    } catch (err) {
      self.app.crash("Jade viewfile for " + controller + "#" + action +
          " not found.", res);
    }
    return html;
  };

  self.base_view = function(controller, action, filepath) {
    return [
        "h2 " + controller + "#" + action
      , "p Edit this file (" + filepath + ")."
    ].join("\n");
  };

  self.base_layout = function() {
    return [
        "!!! 5"
      , "html"
      , "  head"
      , "    title= title"
      , '    link(rel="stylesheet", href="/stylesheets/style.css")'
      , "  body!= yield"
    ].join("\n");
  };
};
