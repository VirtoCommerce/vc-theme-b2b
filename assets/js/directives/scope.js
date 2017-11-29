storefrontApp.directive('vcScope', ['$animate', '$compile', function ($animate) {
    return {
        multiElement: true,
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        link: function ($scope, $element, $attr, ctrl, $transclude) {
            $transclude(function (clone) {
                $element.after(clone);
            });
        }
    }
}]);
