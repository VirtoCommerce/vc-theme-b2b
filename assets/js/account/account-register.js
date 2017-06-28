var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'loadingIndicatorService', function ($scope, mainContext, corporateRegisterApi, loader) {
    $scope.loader = loader;
    $scope.memberComponent = null;
    $scope.newMember = null;

    $scope.init = function (storeId) {
        $scope.newMember = {};
        $scope.newMember.storeId = storeId;

        $scope.registrationComplete = false;

    };

    $scope.register = function () {
        if (this.memberComponent.validate()) {
            $scope.loader.wrapLoading(function () {
                return corporateRegisterApi.register($scope.newMember, function (result) {

                    if (result.message) {
                        alert(result.message);
                    }
                    else {
                        $scope.registrationComplete = true;
                    }
                }).$promise;
            });
        }
    };
}]);