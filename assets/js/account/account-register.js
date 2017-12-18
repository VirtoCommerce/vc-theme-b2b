var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'storefront.accountApi', 'loadingIndicatorService', 'vcRecaptchaService',
    function ($q, $scope, mainContext, corporateRegisterApi, corporateApiErrorHelper, accountApi, loader, vcRecaptchaService) {
        $scope.loader = loader;
        $scope.memberComponent = null;

        var $ctrl = this;
        $ctrl.countries = accountApi.getCountries();

        $scope.isOrg = function () {
            return $scope.member.type === 'Business';
        };

        $scope.$watch('member.address.countryCode', function () {
            if ($scope.member.address.countryCode) {
                populateRegionalDataForAddress($scope.member.address);
                $scope.member.address.name = stringifyAddress($scope.member.address);
            }
        });

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere($ctrl.countries, { code3: address.countryCode });
                if (address.country) {
                    address.countryName = address.country.name;
                    address.countryCode = address.country.code3;

                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        //$ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                        accountApi.getCountryRegions(address.country, function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                address.regionId = address.region.code;
                address.regionName = address.region.name;
            }
            else {
                address.regionId = undefined;
                address.regionName = undefined;
            }
        }

        function stringifyAddress(address) {
            var addressType = '';

            //var type = _.find($ctrl.types, function (i) { return i.id == $ctrl.address.addressType });
            //if (type)
            //    addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.companyName ? address.companyName + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

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
                visible: true,
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
            $scope.member = { storeId: storeId, type: 'Business', address: {} };

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

                $scope.member.invite = invite;
                $scope.loader.wrapLoading(function () {
                    return corporateRegisterApi.getRegisterInfoByInvite({ invite: invite }).$promise
                        .then(function (result) {
                            if (result.message) {
                                $scope.error = result.message;
                                return $q.reject("Invite is invalid");
                            }
                            $scope.member.companyName = result.companyName;
                            $scope.member.email = result.email;
                        });
                });
            }
        };

        //$scope.stepEntered = function () { };

        $scope.submit = function () {
            $ctrl.error = {};
            var hasError = false;
            var member = $scope.member;
            var errorMsg = member.password.length < 5;
            $ctrl.error.password = errorMsg;
            hasError = hasError || errorMsg;

            if (!hasError) {
                errorMsg = member.password !== member.confirmPassword;
                $ctrl.error.confirmPassword = errorMsg;
                hasError = hasError || errorMsg;
            }

            if (!hasError) {
                //loader.wrapLoading(function () {
                //    return corporateRegisterApi.register(member, function (result) {
                //        corporateApiErrorHelper.clearErrors($scope);

                //    }, function (rejection) {
                //        corporateApiErrorHelper.handleErrors($scope, rejection);
                //        $scope.outerRedirect($scope.baseUrl + 'account');
                //    }).$promise; 
                //});

                corporateApiErrorHelper.clearErrors($scope);

                //if (this.memberComponent.validate()) {
                if ($scope.member.invite) {
                    $scope.loader.wrapLoading(function () {
                        return corporateRegisterApi.registerByInvite({ invite: $scope.member.invite }, $scope.member, function (result) {
                            //$scope.complete = true;
                        }, function (rejection) {
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise;
                    });
                } else {
                    $scope.loader.wrapLoading(function () {
                        return corporateRegisterApi.register($scope.member, function (result) {
                            $scope.userName = $scope.member.username;
                            $scope.password = $scope.member.password
                            $scope.login();
                            //$scope.complete = true;
                        }, function (rejection) {
                            vcRecaptchaService.reload();
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise;
                    });
                }
                //}
            }
        };
    }]);
