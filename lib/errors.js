var Errors = function(app) {
  this.app = app;
  this._404 = function(res) {
    /* TODO -- serve public/404.html or something here? */
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("<!DOCTYPE html><html><body><h1>Jelly</h2><h2>404 Not Found</h2>");
    if (app.debug) {
      res.write("<p>If you think this is a mistake, check your routes:</p>");
      res.write("<pre>" + require("util").inspect(app.router.routes).split(',').join(",\n ") + "</pre>");
    }
    res.write("</body></html>");
    res.end();
  };
  this._500 = function(res, msg, err) {
    if (app.debug) {
      // TODO -- move this elsewhere, pass error code, mime type, and content
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><body><h1>Jelly</h1><h2>500 Error: " +
          (app.debug ? msg : "Please contact a system administrator.") + "</h2>");
      if (app.debug) {
        res.write("<pre>")
        res.write(err.stack.split(" at ").join(""));
        res.write("</pre>");
      }
      res.write("</body></html>");
      res.end();
    } else {
      console.error(msg);
      if (err) throw err;
      /* TODO -- wow, don't want to exit here if not in debug! */
      process.exit();
    }
  };
};

exports.Errors = Errors;
