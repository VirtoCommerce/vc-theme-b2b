var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'loadingIndicatorService', 'vcRecaptchaService', 'commonService', 'WizardHandler',
    function ($q, $scope, mainContext, loader, vcRecaptchaService, commonService, WizardHandler) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.finished = false;
        $ctrl.steps = [];
        $ctrl.current_Step = null;
        commonService.getCountries().then(function (response) {
            $ctrl.countries = response.data;
        });

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
            $scope.member = { storeId: storeId, type: 'Business', address: {}, email: null };
            $scope.stepTwoForm = { };
            $scope.stepThreeForm = { };
        };

        $scope.setForm = function (form) { $ctrl.formScope = form; };

        $scope.addStepForm = function (form) { 
            if (form && !_.contains($ctrl.steps, form)) {
                $ctrl.steps.push(form);
            }
        };

        $scope.finishedWizard = function() {
            $ctrl.finished = !$scope.create_customer.$invalid;
            return $ctrl.finished;
        };

        $scope.stepValidation = function(){
            var sc = $scope;
            var form = $scope.create_customer;
            var stepNumber = WizardHandler.wizard().currentStepNumber();
            var myElement = angular.element( document.querySelector( '#step'+ stepNumber ) );
            var valid = true;
            angular.forEach(myElement.find('input'), function(node){ 
                if (valid && node.name) {
                    var prop = form[node.name];
                    if (((prop.$dirty || form.$submitted) && prop.$error.required) ||
                        ((prop.$dirty || form.$submitted) && !prop.$error.required && prop.$invalid) ||
                        (prop.$pristine && prop.$invalid)) {
                        valid = false;
                    }
                }
            });
            return valid;
        }

    }]);
