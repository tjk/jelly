//var models = require("./models");
var view = require("./../views/post_view");

function index(response) {
  var embed = {"title":"tjk.me"};
  view.render("main", embed, response);
}

function admin(response) {
  var embed = {"title":"Admin Page"};
  view.render("admin", embed, response);
}

exports.index = index;
exports.admin = admin;
