var renderer = require("./../views/renderer");

function index(response) {
  var embed = {"title":"Administration login"};
  renderer.render("admin", embed, response);
}

exports.index = index;
