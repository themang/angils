
angular.module('angils', [])
.factory('promiseStatus', ['$q', function($q) {
  return function(promise) {
    var tracker = promise.then(function(value) {
      tracker.success = true;
    }, function(err) {
      tracker.error = err;
    }, function(progress) {
      tracker.progress = progress;
    })['finally'](function() {
      tracker.loading = false;
    });
    tracker.loading = true;
    return tracker
  }
}]);