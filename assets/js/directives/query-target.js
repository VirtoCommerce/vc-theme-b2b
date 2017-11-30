var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcQueryTarget', ['$parse', '$location', 'searchQueryService', function ($parse, $location, searchQueryService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var vcQueryTarget = $parse(attrs.vcQueryTarget);
            // get requested keys and set ng-model value to value of ?key1=value1&key2=value2
            var state = searchQueryService.deserialize($location.search(), vcQueryTarget(scope));
            vcQueryTarget.assign(scope, state);
        }
    }
}]);
