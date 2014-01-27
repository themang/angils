var _ = require('lodash');

require('./jquery.selector.focusable.js');

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
}])
.directive('debouncedChange', ['$parse', function($parse) {
  return {
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        ctrl.$viewChangeListeners.push(_.debounce(function() {
          scope.$eval(attrs.debouncedChange);
        }, 500));
      }
    }; 
}])
.directive('throttledChange', ['$parse', function($parse) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$viewChangeListeners.push(_.throttle(function() {
        scope.$eval(attrs.throttledChange);
      }, 500));
    }
  };
}])
.directive('viewTrigger', function() {
  return {
    require: ['ngModel', '^form'],
    link: function(scope, element, attrs, ctrls) {
      var targets = attrs.viewTrigger.split(',');
      ctrls[0].$viewChangeListeners.push(function() {
        _.each(targets, function(target) {
          var ctrl = ctrls[1][target];
          ctrl && ctrl.$setViewValue(ctrl.$viewValue);
        });
      });
    }
  };
})
.directive('focusable', function() {
  return {
    link: function(scope, element, attrs) {
      if(! element.is(':focusable') && ! _.has(attrs, 'tabindex'))
        element.attr('tabindex', -1);
    }
  };
})
.directive('ngFocusLost', ['$parse', 'focusableDirective',
function($parse, focusableDirective) {
  return function(scope, element, attrs) {
    focusableDirective[0].link(scope, element, attrs);

    var fn = $parse(attrs.ngFocusLost);
    element.bind('focusout', scope.$applied(function(e) {
      if(! element.has(e.relatedTarget).length)
        fn(scope);
    }));
  };
}])
.directive('ngFocusIn', ['focusableDirective', function(focusableDirective) {
  return function(scope, element, attrs) {
    focusableDirective[0].link(scope, element, attrs);
    element.bind('focusin', scope.$applied(attrs.ngFocusIn));
  };
}])
.directive('ngFocusOut', ['focusableDirective', function(focusableDirective) {
  return function(scope, element, attrs) {
    focusableDirective[0].link(scope, element, attrs);
    element.bind('focusout', scope.$applied(attrs.ngFocusOut));
  };
}])
.directive('ngFocus', ['focusableDirective', function(focusableDirective) {
  return function(scope, element, attrs) {
    focusableDirective[0].link(scope, element, attrs);
    element.bind('focus', scope.$applied(attrs.ngFocus));
  };
}])
.directive('ngBlur', ['focusableDirective', function(focusableDirective) {
  return function(scope, element, attrs) {
    focusableDirective[0].link(scope, element, attrs);
    element.bind('blur', scope.$applied(attrs.ngBlur));
  };
}])
.directive('dirtyOnSubmit', [function() {
  return {
    require: 'form',
    link: function(scope, element, attrs, ctrl) {
      element.bind('submit', scope.$applied(function() {
        var fieldControls = _.filter(ctrl, function(fCtrl, name) {
          return _.has(fCtrl, '$viewValue') && _.has(fCtrl, '$modelValue');
        });
        console.log('submit');
        _.each(fieldControls, function(fCtrl) {
          fCtrl.$setViewValue(fCtrl.$viewValue);
        });
      }));
    }
  }
}]);
