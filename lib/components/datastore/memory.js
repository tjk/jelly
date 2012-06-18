exports.Memory = function() {
  var self = this;

  self.storage = {};

  self.set = function(key, value) {
    self.storage[key] = value;
  };

  self.get = function(key, _default) {
    return self.storage[key] ? self.storage[key] : _default;
  };
};
