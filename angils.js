var _ = require('lodash');

angular.module('angils', [])
.config(['$provide', function($provide) {
  $provide.decorator('$rootScope', ['$delegate', '$injector',
  function($rootScope, $injector) {
    function safe() {
      return ! $rootScope.$$phase;
    }

    function digestNow() {
      safe() && $rootScope.$digest();
    }

    _.extend($rootScope.__proto__, {
      $$log: function() {
        return console.log.apply(console, arguments);
      },
      $applied: function(expr) {
        var $scope = this;
        return function() {
          if(! $scope.$eval) return;

          var self = this
            , args = _.toArray(arguments)
            , ret = $scope.$eval(_.isFunction(expr) ? function() {
            return expr.apply(self, args);
          } : expr);
          digestNow();
          return ret;
        };
      },
      $safeApply: function(expr) {
        return safe()
          ? this.$apply(expr)
          : this.$eval(expr);
      },
      $safeDigest: digestNow,
      $when: function(expr, fn) {
        var handle = this.$watch(expr, function(val) {
          if(!! val) {
            fn && fn(val);
            handle();
          }
        });
      }
    });

    return $rootScope;
  }]);
}])
.factory('promiseStatus', ['$q', function($q) {
  return function(promise) {
    promise.then(function(value) {
      promise.success = true;
      promise.loading = false;
      promise.status = 'success';
    }, function(err) {
      promise.error = err;
      promise.loading = false;
      promise.status = 'error';
    }, function(progress) {
      promise.progress = progress;
    });
    promise.loading = true;
    promise.status = 'loading';
    return promise;
  }
}]);