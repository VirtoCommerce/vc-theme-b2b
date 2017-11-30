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
                    scope.$watch(function () {
                        return [attrs.vcQuerySource, attrs.switchable];
                    }, function (obj) {
                        var querySource = $parse(obj[0])(scope);
                        var switchable = obj[1] == 'true';
                        var state = searchQueryService.deserialize($location.search(), {});
                        var result = searchQueryService.merge(state, querySource, switchable);
                        var params = searchQueryService.serialize(result, {});
                        var url = new URL($location.absUrl());
                        url.search = $httpParamSerializer(params);
                        element.attr("href", url.href);
                    }, true);
                }
            }
        }
    }
}]);
