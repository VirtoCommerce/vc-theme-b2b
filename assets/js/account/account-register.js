var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'loadingIndicatorService', 'vcRecaptchaService', 'commonService', 'WizardHandler', 'accountApi', 
    function ($q, $scope, mainContext, loader, vcRecaptchaService, commonService, WizardHandler, accountApi) {
        $scope.loader = loader;
        $scope.finished = false;
        commonService.getCountries().then(function (response) {
            $scope.countries = response.data;
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
        //Watch any address changes to repopulate address properties for user selection 
        $scope.$watch('registration.address', function (address) {
            if (address) {
                populateRegionalDataForAddress(address);
            }
        }, true);

        $scope.init = function (storeId) {
            $scope.registration = { storeId: storeId, type: 'Business', address: {}, email: null };
            $scope.switchTemplate($scope.registration.type);
        };
   
        $scope.finishedWizard = function() {
            return loader.wrapLoading(function () {
                return accountApi.registerOrganization($scope.registration).then(function (response) {
                    if (response.data.succeeded) {
                        $scope.outerRedirect($scope.baseUrl);
                    } else {
                        if (response.data.errors) {
                            $scope.errors = _.map(response.data.errors, function(err){ return err.description; });
                        }
                    }
                });
            });
        };

        $scope.switchTemplate = function (type) {
            if (type === 'Business') {
                $scope.step1TemplateUrl = 'step1-business';
                $scope.step2TemplateUrl = 'step2-business';
            }
            else if (type === 'Personal') {
                $scope.step1TemplateUrl = 'step1-personal';
                $scope.step2TemplateUrl = 'step2-personal';
            }
                
        }
    }]);
