// TODO -- oh golly, refactor the $&#@ out of this
exports.Errors = function(app) {
  var self = this;
  self.app = app;

  self._404 = function(res, err) {
    var routes = self.app.router.routes;
    res.writeHead(404, { "Content-Type": "text/html" });
    if (self.app.debug) {
      res.write("<!DOCTYPE html><html><head><title>Jelly 400 Error</title>" +
          "<link rel=\"stylesheet\" href=\"/stylesheets/style.css\" type=\"text/css\" />" +
          "</head><body><h1>Jelly</h2><h2>404 Not Found</h2>");
      if (err) {
        res.write("<pre id=\"hints\">");
        res.write(err.stack.split(" at ").join(""));
        res.write("</pre>");
      }
      res.write("<p>If you think this is a mistake, check your routes:</p>");
      // res.write("<pre>" + require("util").inspect(this.app.router.routes).split(',').join(",\n ") + "</pre>");
      res.write("<table id=\"routes\"><thead><tr><th>controller#action</th><th>path</th><th>method</th></tr></thead><tbody>");
      for (i in routes) {
        res.write("<tr><td>" + routes[i] + "</td><td><a href=\"" +
          i + "\">" + i + "</a></td><td>GET</td></tr>");
      };
      res.write("</tbody></table>");
      res.write("</body></html>");
    } else {
      /* TODO -- serve public/404.html */
      throw new Exception("serve public/404.html");
    }
    res.end();
  };

  self._500 = function(res, msg, err) {
    if (self.app.debug) {
      // TODO -- move this elsewhere, pass error code, mime type, and content
      // TODO -- maybe to views.js ?
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html><html><head><title>Jelly 500 Error</title>" +
          "<link rel=\"stylesheet\" href=\"/stylesheets/style.css\" type=\"text/css\" />" +
          "</head><body><h1>Jelly</h1><h2>500 Error: " +
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
