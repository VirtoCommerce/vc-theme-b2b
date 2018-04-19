var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('apiErrorService', ['$rootScope', function ($rootScope) {
    return {
        clearErrors: function ($scope) {
            $scope.errorMessage = null;
            $scope.errors = null;
        },
        handleErrors: function ($scope, response) {
            if (!response.data.succeeded) 
                $scope.errorMessage = response.data.message;
                $scope.errors = response.data.errors;
            }
        }
    }
}]);
