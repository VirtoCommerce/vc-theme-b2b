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

storefrontApp.directive('vcQuery', ['$parse', '$location', '$httpParamSerializer', function ($parse, $location, $httpParamSerializer) {
    return {
        restrict: "A",
        compile: function (tElem, tAttr) {
            if (!tAttr.href && !tAttr.xlinkHref) {
                return function(scope, element, attrs) {
                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') return;

                    // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
                    var href = toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                        'xlink:href' : 'href';
                    var type = attrs.queryType || 'pair';

                    function stringToObject(str) {
                        var pairStrs = str.split(';');
                        var result = {};
                        _.each(pairStrs, function (pairStr) {
                            var pair = pairStr.split(':');
                            var key = pair[0];
                            var values = pair[1].split(',');
                            result[key] = values;
                        });
                        return result;
                    }

                    function objectToString(obj) {
                        return Object.keys(obj).map(function(key) {
                             return key + ':' + obj[key].join(',');
                        }).join(';');
                    }

                    // get query from current url, replace query parts with specified parts and set href
                    scope.$watch($parse(attrs.vcQuery), function (value) {
                        var query = $location.search();
                        if (type === 'pair') {
                            query = angular.extend({ }, query, value);
                        } else if (type === 'array') {
                            _.each(Object.keys(value), function (key) {
                                var queryValues = stringToObject(query[key]);
                                angular.extend(queryValues, value[key]);
                                queryValues = objectToString(queryValues);
                                query[key] = queryValues;
                            });
                        }
                        var url = new URL($location.absUrl());
                        url.search = $httpParamSerializer(query);
                        element.attr(href, url.href);
                    });
                }
            }
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
