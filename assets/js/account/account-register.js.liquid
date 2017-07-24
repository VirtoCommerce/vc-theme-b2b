var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService',
    function ($q, $scope, mainContext, corporateRegisterApi, corporateApiErrorHelper, loader) {

    $scope.loader = loader;
    $scope.memberComponent = null;
    $scope.newMember = null;

    $scope.registerMemberFieldsConfig = [
        {
            field: 'CompanyName',
            disabled: false,
            visible: true,
            required: true
        },
        {
            field: 'Email',
            disabled: false,
            visible: true,
            required: true
        },
        {
            field: 'UserName',
            disabled: false,
            visible: true,
            required: true
        },
        {
            field: 'Password',
            disabled: false,
            visible:  true,
            required: true
        }
    ];

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

        $scope.complete = false;

        var invite = getParams().invite;
        if (invite) {
            $scope.registerMemberFieldsConfig[0] = {
                field: 'CompanyName',
                disabled: true,
                visible: true,
                required: true
            };
            $scope.registerMemberFieldsConfig[1] = {
                field: 'Email',
                disabled: true,
                visible: true,
                required: true
            };

            $scope.newMember.invite = invite;
            $scope.loader.wrapLoading(function() {
                return corporateRegisterApi.getRegisterInfoByInvite({ invite: invite }).$promise
                    .then(function(result) {
                        if (result.message) {
                            $scope.error = result.message;
                            return $q.reject("Invite is invalid");
                        }
                        $scope.newMember.companyName = result.companyName;
                        $scope.newMember.email = result.email;
                    });
            });
        }
    };

    $scope.register = function () {
        $scope.error = null;

        if (this.memberComponent.validate()) {
            if ($scope.newMember.invite) {
                $scope.loader.wrapLoading(function () {
                    return corporateRegisterApi.registerByInvite({ invite: $scope.newMember.invite }, $scope.newMember, function (result) {
                        $scope.complete = true;
                        corporateApiErrorHelper.clearErrors($scope);
                    }, function (rejection){
                        corporateApiErrorHelper.handleErrors($scope, rejection);
                    }).$promise;
                });
            } else {
                $scope.loader.wrapLoading(function() {
                    return corporateRegisterApi.register($scope.newMember, function (result) {
                        $scope.complete = true;
                        corporateApiErrorHelper.clearErrors($scope);
                    }, function (rejection){
                        corporateApiErrorHelper.handleErrors($scope, rejection);
                    }).$promise;
                });
            }
        }
    };
}]);