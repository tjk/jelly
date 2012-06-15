exports.Jade = function() {
  var self = this;

  self.extension = ".html.jade";

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
