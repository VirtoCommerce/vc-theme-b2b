var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'storefront.accountApi', 'loadingIndicatorService',
    function ($q, $scope, mainContext, corporateRegisterApi, corporateApiErrorHelper, accountApi, loader) {
        $scope.loader = loader;
        $scope.memberComponent = null;
        $scope.member = { type: 'Business', address: {} };

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
                        //ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
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

            //var type = _.find(ctrl.types, function (i) { return i.id == ctrl.address.addressType });
            //if (type)
            //    addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
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
            $scope.member = { storeId: storeId };

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

        $scope.register = function () {
            $scope.error = null;

            if (this.memberComponent.validate()) {
                if ($scope.member.invite) {
                    $scope.loader.wrapLoading(function () {
                        return corporateRegisterApi.registerByInvite({ invite: $scope.member.invite }, $scope.member, function (result) {
                            $scope.complete = true;
                            corporateApiErrorHelper.clearErrors($scope);
                        }, function (rejection) {
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise;
                    });
                } else {
                    $scope.loader.wrapLoading(function () {
                        return corporateRegisterApi.register($scope.member, function (result) {
                            $scope.complete = true;
                            corporateApiErrorHelper.clearErrors($scope);
                        }, function (rejection) {
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise;
                    });
                }
            }
        };
    }]);
