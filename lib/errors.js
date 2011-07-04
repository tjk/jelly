var Errors = function(app) {
  this.app = app;
  this._404 = function(res, err) {
    /* TODO -- serve public/404.html or something here? */
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("<!DOCTYPE html><html><body><h1>Jelly</h2><h2>404 Not Found</h2>");
    if (app.debug) {
      if (err) {
        res.write("<pre id=\"hints\">");
        res.write(err.stack.split(" at ").join(""));
        res.write("</pre>");
      }
      res.write("<p>If you think this is a mistake, check your routes:</p>");
      res.write("<pre>" + require("util").inspect(app.router.routes).split(',').join(",\n ") + "</pre>");
    }
    res.write("</body></html>");
    res.end();
  };
  this._500 = function(res, msg, err) {
    if (app.debug) {
      // TODO -- move this elsewhere, pass error code, mime type, and content
      // TODO -- maybe to views.js ?
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><body><h1>Jelly</h1><h2>500 Error: " +
          msg + "</h2>");
      if (err) {
        res.write("<pre id=\"hints\">")
        res.write(err.stack.split(" at ").join(""));
        res.write("</pre>");
      }
      res.write("</body></html>");
      res.end();
    } else {
      console.error(msg);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><body><h1>Jelly</h1><h2>500 Error: " +
          "Please contact a system administrator</h2");
      res.write("</body></html>");
      res.end();
    }
  };
};

exports.Errors = Errors;
