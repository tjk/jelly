var path = require("path")
  , util = require("util");

var BaseController = function(app) {
  this.app = app;
  this.precedence_select = function(first, second, _default) {
    return first ? first : second ? second : _default;
  };
  // TODO -- lots of params thrown around =/
  this.handle = function(controller_name, action, res, params, fmt) {
    /* vars to replace in views are returned by action */
    /* keywords --
     *  + yield  -> default 'body' block of view into layout
     *  + layout -> action-level layout
     */
    var vars = this[action](res, params);
    var layout = this.precedence_select(vars['layout'], this.layout, "app");
    var fmts = this.precedence_select(vars['formats'], this.formats, ['html']);
    // TODO -- clean up params #
    this.render(controller_name, action, res, fmt, vars, layout, fmts);
  };
  // TODO -- move this (partially or fully) to views.js
  this.render = function(controller_name, action, res, fmt, vars, layout, fmts) {
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
      // TODO -- find view from ctrl, action, and add .<engine>
      /* pass vars to some view */
      switch (this.app.options["templating"]) {
        case "jade":
          // TODO -- abstract out everything below to make it nice
          // and reusable for other templating engines -- emphasis on NICE
          var jade = require("jade")
            // TODO -- view file should be preloaded by app -- use that
            , view_filename = app.app_root +
                app.options["views_dir"] + '/' + controller_name +
                '/' + action + ".html.jade";
          try {
            jade.renderFile(view_filename, {locals: vars}, function(view_err, view_html) {
              var locals = "";
              if (view_err) {
                for (var i in vars) { if (i != "__") locals += " " + i }
                app.crash("Jade rendering view failed -- locals set:" + locals + ".", res, view_err);
              } else {
                vars.yield = view_html;
                try {
                  // TODO -- check that this.app.layouts[layout] != undefined
                  var html = jade.render(this.app.layouts[layout], {locals:vars});
                  res.writeHead(200, { "Content-Type": "text/html" });
                  res.write(html);
                  res.end();
                } catch (err) {
                  for (var i in vars) { if (i != "__") locals += " " + i }
                  app.crash("Jade rendering layout failed -- locals set:" + locals + ".", res, err);
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
    }
    /* inappropriate extension, throw 404 */
    else {
      app.errors._404(res);
    }
  };
  this.redirect = function(res, controller_name, action_name) {
    // TODO -- this may possibly be terrible
    this.app.controllers[controller_name][action_name](res);
  };
};

exports.BaseController = BaseController;
