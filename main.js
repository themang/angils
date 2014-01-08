
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
}]);