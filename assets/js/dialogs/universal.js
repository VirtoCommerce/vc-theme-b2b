var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('universalDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
    angular.extend($scope, dialogData);

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    }
}]);
