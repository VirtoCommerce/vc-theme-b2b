var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcQuerySource', ['$parse', '$location', '$httpParamSerializer', 'searchQueryService', function ($parse, $location, $httpParamSerializer, searchQueryService) {
    return {
        restrict: "A",
        compile: function (tElem, tAttr) {
            if (!tAttr.href) {
                return function (scope, element, attrs) {
                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') return;

                    // get query from current url, replace query parts with specified parts and set href
                    var setUrl = function (querySource, switchable) {
                        switchable = switchable == 'true';
                        var state = searchQueryService.deserialize(searchQueryService.get(), {});
                        var result = searchQueryService.merge(state, querySource, switchable);
                        var params = searchQueryService.serialize(result, {});
                        var url = new URL($location.absUrl());
                        url.search = $httpParamSerializer(params);
                        element.attr("href", url.href);
                    };
                    scope.$watch(function () {
                        return $parse(attrs.vcQuerySource)(scope);
                    }, function (value) {
                        setUrl(value, attrs.switchable);
                    }, true);
                    scope.$watch(function () {
                        return attrs.switchable;
                    }, function (value) {
                        setUrl($parse(attrs.vcQuerySource)(scope), value);
                    });
                }
            }
        }
    }
}]);
