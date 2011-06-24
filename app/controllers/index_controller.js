//var env = require($ENV); // something like this?
//var render = require(env.views + "renderer").render;
var render = require("./../views/renderer").render;

function index(response) {
  var embed = {"title":"tjk.me"};
  render("main", embed, response);
}

exports.index = index;
