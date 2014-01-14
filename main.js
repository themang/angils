angular.module('angils', [])
.factory('promiseStatus', ['$q', function($q) {
  return function(promise) {
    promise.then(function(value) {
      promise.success = true;
      promise.loading = false;
    }, function(err) {
      promise.error = err;
      promise.loading = false;
    }, function(progress) {
      promise.progress = progress;
    });
    return promise;
  }
}])
.factory('ObjectStack', function() {
  function ObjectStack(defaults) {
    this.__history = [];
    this.__defaults = defaults || {};
    _.extend(this, defaults);
  }

  function isObjectStackKey(key) {
    return key.indexOf('__') === 0;
  }

  ObjectStack.prototype.push = function() {
    this.__history.push(_.reduce(this, function(memo, val, key) {
      if(! isObjectStackKey(key))
        memo[key] = val;
      return memo;
    }, {}));
    return this;
  };

  ObjectStack.prototype.set = function(fields) {
    _.extend(this, fields);
    return this;
  };

  ObjectStack.prototype.pop = function() {
    this.clear();
    _.extend(this, this.__history.pop());
    return this;
  };

  ObjectStack.prototype.clear = function() {
    _.each(this, function(val, key) {
      if(! isObjectStackKey(key))
        delete this[key];
    }, this);
    _.extend(this, this.__defaults);
    return this;
  };

  ObjectStack.prototype.history = function() {
    var copy = this.__history.slice(0);
    copy.unshift(this.__defaults);
    return copy;
  };

  ObjectStack.prototype.last = function() {
    return _.last(this.__history);
  };

  ObjectStack.prototype.reset = function() {
    this.clear();
    this.__history = [];
    return this;
  };

  ObjectStack.prototype.size = function() {
    return this.__history.length;
  };

  return ObjectStack;
});