// need to leave this as renderer or something and let views extend from this
var fs = require("fs");
var routes = require("./../../config/router").routes;

// GET curr_dir set elsewhere -- see top of conroller using render
var curr_dir = './app/views/', ext = ".js.html";

function link(text, hashy) {
  for (var key in routes)
    if (routes[key] === hashy) return '<a href="'+key+'">'+text+'</a>'; // url -> key
  throw "Link hashy " + hashy + " is not valid";
}

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
    // do some crazy expansion of {{_key}} from _key.js.html and make sure the expanded {{subkey$index}} goes up
    // the same size as the for loop it could be wrapped around... make sure the sub object with fields of
    // those var names has the same .size() as highest $index-1?
    html += data;
    // replace embed
    for (var key in embed) {
      html = html.replace(new RegExp("{{" + key + "}}", "g"), embed[key]);
    }
    // replace links {{Hey there!}http://google.com}
    var match = '';
    while (match != undefined) {
      match = html.match(/{{([^}]+)}([^}]+)}/);
      console.log(require('util').inspect(match));
      // RIGHT HEREEEEEE
      //html = html.replace(new RegExp("{{("+
    }
    // return HTML
    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(html);
    response.end();
  });
}

exports.render = render;
