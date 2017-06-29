var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$scope', 'storefrontApp.mainContext', 'storefront.corporateAccountApi', 'storefront.corporateRegisterApi', 'loadingIndicatorService', function ($scope, mainContext, corporateAccountApi, corporateRegisterApi, loader) {
    $scope.loader = loader;
    $scope.memberComponent = null;
    $scope.newMember = null;

    function getParams() {
        var params = window.location.search.substring(1).split("&"), result = {}, param, i;
        for (i in params) {
            if (params.hasOwnProperty(i)) {
                if (params[i] === "") continue;

                param = params[i].split("=");
                result[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
            }
        }
        return result;
    }

    $scope.init = function (storeId) {
        $scope.newMember = {};
        $scope.newMember.storeId = storeId;

        var invite = getParams().invite;
        if (invite) {
            $scope.newMember.invite = invite;
            $scope.loader.wrapLoading(function() {
                return corporateAccountApi.getCompanyMember({ id: invite }, function (result) {
                    $scope.newMember.companyId = result.organizations[0];
                    $scope.newMember.email = result.emails[0];
                }).$promise.then(function() {
                    return corporateAccountApi.getCompanyById({ id: $scope.newMember.companyId }, function (result) {
                        $scope.newMember.companyName = result.name;
                    }).$promise;
                });
            });
        }

        $scope.registrationComplete = false;

    };

    $scope.register = function () {
        if (this.memberComponent.validate()) {
            if ($scope.newMember.invite) {
                $scope.loader.wrapLoading(function () {
                    return corporateRegisterApi.registerByInvite({ invite: $scope.newMember.invite }, $scope.newMember, function (result) {
                        if (result.message) {
                            alert(result.message);
                        } else {
                            $scope.registrationComplete = true;
                        }
                    }).$promise;
                });
            } else {
                $scope.loader.wrapLoading(function() {
                    return corporateRegisterApi.register($scope.newMember, function(result) {
                        if (result.message) {
                            alert(result.message);
                        } else {
                            $scope.registrationComplete = true;
                        }
                    }).$promise;
                });
            }
        }
    };
}]);