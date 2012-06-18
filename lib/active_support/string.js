String.prototype.camelcase = function() {
  return this.split("_").map(function(e) {
    return e.replace(/^([a-z])/g, function($1) {
      return $1.toUpperCase();
    });
  }).join("");
};

String.prototype.underscorize = function() {
  return this.replace(/([A-Z])/g, function($1) {
    return "_" + $1.toLowerCase();
  }).replace(/^_/g, "");
};
