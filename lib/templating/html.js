exports.Html = function() {
  var self = this;

  self.extension = ".html";

  self.base_view = function(controller, action, filepath) {
    return [
        "<h2>" + controller + "#" + action + "</h2>"
      , "<p>Edit this file (" + filepath + ").</p>"
    ].join("\n");
  };

  self.base_layout = function() {
    return [
        "<!DOCTYPE html>"
      , '<html lang="en">'
      , "  <head>"
      , "    <title>*title*</title>"
      , '    <link rel="stylesheet" type="text/css" href="/stylesheets/style.css">'
      , "  </head>"
      , "  <body>"
      , "    <h1>Use an actual templating engine!</h1>"
      , "  </body>"
      , "</html>"
    ].join("\n");
  };
};
