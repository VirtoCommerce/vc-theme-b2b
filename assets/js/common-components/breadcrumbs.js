var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcBreadcrumbs', {
    templateUrl: "themes/assets/breadcrumbs.tpl.html",
    bindings: {
        router: '<'
    },
    controller: ['$scope', '$rootRouter', function ($scope, $rootRouter) {
        var $ctrl = this;

        $ctrl.instructions = [];
        $scope.$watch(function() {
            return $ctrl.router._currentInstruction;
        }, function (instruction) {
            if (instruction) {
                $ctrl.instructions.length = 0;
                var current = $ctrl.router;
                while (current) {
                    $ctrl.instructions.push(current._currentInstruction);
                    current = current.parent;
                }
                $ctrl.instructions.reverse();
            }
        });

        $ctrl.go = function(instruction) {
            $rootRouter.commit(instruction);
        }
    }]
});