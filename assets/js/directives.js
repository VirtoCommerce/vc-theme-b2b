var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcContentPlace', ['$compile', 'marketingService', function ($compile, marketingService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            marketingService.getDynamicContent(attrs.id).then(function (response) {
                element.html($compile(response.data)(scope));
            });
        },
        replace: true
    }
}]);

storefrontApp.directive('vcEnterSource', ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        controller: function() { },
        link: function (scope, element, attrs, ctrl) {
            var onKeyPress = function (event) {
                if (event.keyCode === 13) { // Enter
                    ctrl.element[0].click();
                }
            };
            element.on('keypress', onKeyPress);
            scope.$on('$destroy', function () {
                element.off('keypress', onKeyPress);
            });
        }
    };
}]);

storefrontApp.directive('vcEnterTarget', [function () {
    return {
        restrict: "A",
        require: "^vcEnterSource",
        link: function (scope, element, attrs, ctrl) {
            ctrl.element = element;
        }
    };
}]);

storefrontApp.directive('vcQuerySource', ['$parse', 'searchQueryService', function ($parse, searchQueryService) {
    return {
        restrict: "A",
        compile: function (tElem, tAttr) {
            if (!tAttr.href) {
                return function(scope, element, attrs) {
                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') return;

                    // get query from current url, replace query parts with specified parts and set href
                    scope.$watch(function() {
                         return [attrs.vcQuerySource, attrs.queryType];
                    }, function (obj) {
                        var querySource = $parse(obj[0])(scope);
                        var queryType = $parse(obj[1])(scope);
                        var href = searchQueryService.getLink(querySource, queryType);
                        element.attr("href", href);
                    }, true);
                }
            }
        }
    }
}]);

storefrontApp.directive('vcQueryTarget', ['$parse', 'searchQueryService', function ($parse, searchQueryService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var vcQueryTarget = $parse(attrs.vcQueryTarget);
            // get requested keys and set ng-model value to value of ?key1=value1&key2=value2
            var t = vcQueryTarget(scope);
            var state = searchQueryService.getState(t);
            vcQueryTarget.assign(scope, state);
        }
    }
}]);

// based on https://github.com/angular/angular.js/blob/master/src/ng/directive/ngInclude.js
storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('ngIncludeDirective', ['$delegate', function ($delegate) {
        var includeFillContentDirective = $delegate[1];
        var link = includeFillContentDirective.link;
        includeFillContentDirective.link = function (scope, $element, $attr, ctrl) {
            if (!Object.keys($attr).includes('raw')) {
                link(scope, $element, $attr, ctrl);
            } else {
                $element.text(ctrl.template);
            }
        };
        includeFillContentDirective.compile = function() {
            return includeFillContentDirective.link;
        };
        $delegate[1] = includeFillContentDirective;
        return $delegate;
    }]);
}]);

storefrontApp.directive('vcScope', ['$animate', '$compile', function ($animate) {
    return {
        multiElement: true,
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        link: function ($scope, $element, $attr, ctrl, $transclude) {
            var childScope, block;
            $transclude(function (clone) {
                $element.after(clone);
            });
        }
    }
}]);

storefrontApp.directive('fallbackSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('error', errorHandler);

            scope.$on('$destroy', function() {
                element.off('error', errorHandler);
            });

            function errorHandler(event) {
                if (element.attr('src') !== attrs.fallbackSrc) {
                    element.attr('src', attrs.fallbackSrc);
                }
                else {
                    element.off(event);
                }
            };
        }
    }
});
