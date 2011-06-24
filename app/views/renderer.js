// need to leave this as renderer or something and let views extend from this
var fs = require("fs");

// GET curr_dir set elsewhere -- see top of conroller using render
var curr_dir = './app/views/', ext = ".js.html";

function render(layout, embed, response) {
  var html = "";
  fs.readFile(curr_dir + layout + ext, function(err, data) {
    if (err) {
      // make err module and have err.300(), err.404(), etc.
      response.writeHead(300, {"Content-Type":"text/html"});
      response.write("<!DOCTYPE html><html><head></head><body><h1>300 Internal Server Error</h1><h2>Error encountered</h2><p>" + err.message + "</p></body></html>"); 
      response.end();
      return;
    }
    html += data;
    // do some crazy expansion of {{_key}} from _key.js.html and make sure the expanded {{subkey$index}} goes up
    // the same size as the for loop it could be wrapped around... make sure the sub object with fields of
    // those var names has the same .size() as highest $index-1?
    for (var key in embed) {
      html = html.replace(new RegExp("{{" + key + "}}", "g"), embed[key]);
    }
    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(html);
    response.end();
  });
}

exports.render = render;
