var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'loadingIndicatorService', 'vcRecaptchaService', 'commonService', 'WizardHandler', 'accountApi', 
    function ($q, $scope, mainContext, loader, vcRecaptchaService, commonService, WizardHandler, accountApi) {
        $scope.loader = loader;
        $scope.finished = false;
        commonService.getCountries().then(function (response) {
            $scope.countries = response.data;
        });

        $scope.isOrg = function () {
            return $scope.registration.type === 'Business';
        };

        $scope.$watch('registration.address.countryCode', function () {
            if ($scope.registration.address.countryCode) {
                populateRegionalDataForAddress($scope.registration.address);
                $scope.registration.address.name = stringifyAddress($scope.registration.address);
            }
        });

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere($scope.countries, { code3: address.countryCode });
                if (address.country) {
                    address.countryName = address.country.name;
                    address.countryCode = address.country.code3;

                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        //$ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                        commonService.getCountryRegions(address.country.code3).then(function (response) {
                            address.country.regions = response.data;
                            setAddressRegion(address, response.data);
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

        $scope.init = function (storeId) {
            $scope.registration = { storeId: storeId, type: 'Business', address: {}, email: null };
        };
   
        $scope.finishedWizard = function() {
            return loader.wrapLoading(function () {
                return accountApi.registerOrganization($scope.registration).then(function () {
                    //TODO: Redirect to main page
                    alert("//TODO: Redirect to main page");
                });
            });
        };


    }]);
