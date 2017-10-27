storefrontApp.controller('universalDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
    $scope.dialogData = dialogData;

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    }
}]);
