var path = require("path");
var util = require("util");

exports.ApplicationController = function(app) {
  var self = this;
  self.app = app;

  self.actions = {};

  self.choose = function(vars, attr, _default) {
    if (vars && typeof vars[attr] !== "undefined")
      return vars[attr];
    return self[attr] ? self[attr] : _default;
  };

  // TODO -- lots of params thrown around =/
  self.handle = function(controller, action, res, params, fmt) {
    /* vars to replace in views are returned by action */
    /* keywords --
     *  + yield  -> default 'body' block of view into layout
     *  + layout -> action-level layout
     */
   for (var action in self) // TODO wtf?!?! without this loop -- major issue
      console.log("====: " + action); // TODO wtf???
    var vars = self[action](res, params);
    var layout = self.choose(vars, "layout", "app");
    var fmts = self.choose(vars, "formats", ['html']);
    // TODO -- clean up params #
    self.render(controller, action, res, fmt, vars, layout, fmts);
  };

  // TODO -- move this (partially or fully) to views.js
  self.render = function(controller, action, res, fmt, vars, layout, fmts) {
    var vars = vars || {};
    // TODO -- support more content types: csv, etc. ?
    if (fmt === 'txt' && fmts.indexOf('txt') >= 0) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(util.inspect(vars));
      res.end();
    }
    else if (fmt === 'json' && fmts.indexOf('json') >= 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(vars));
      res.end();
    }
    /* default to html */
    else if (fmt.length === 0 || fmt === 'html' && fmts.indexOf('html') >= 0) {
      /* pass vars to some view */
      // TODO -- view file should be preloaded by app -- use that
      // , view_filename = app.app_root +
      //    app.options["views_dir"] + '/' + controller +
      //    '/' + action + ".html.jade";
      var html = self.app.templating.render(controller, action, layout, vars, res);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    }
    /* inappropriate extension, throw 404 */
    else {
      self.app.errors._404(res);
    }
  };

  self.redirect = function(res, controller, action) {
    // TODO -- this may possibly be terrible
    self.app.controllers[controller][action](res);
  };

};
