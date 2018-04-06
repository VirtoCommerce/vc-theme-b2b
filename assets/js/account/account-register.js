var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'loadingIndicatorService', 'vcRecaptchaService', 'commonService', 'accountApi',
    function ($q, $scope, mainContext, loader, vcRecaptchaService, commonService, accountApi) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.finished = false;
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

        //$scope.registerMemberFieldsConfig = [
        //    {
        //        field: 'CompanyName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Email',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'UserName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Password',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    }
        //];

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
            var invite = getParams().invite;
            if (invite) {
                //$scope.registerMemberFieldsConfig[0] = {
                //    field: 'CompanyName',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};
                //$scope.registerMemberFieldsConfig[1] = {
                //    field: 'Email',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};

                $scope.member.invite = invite;
                // $ctrl.loader.wrapLoading(function () {
                //     return accountApi.getRegisterInfoByInvite({ invite: invite }).$promise
                //         .then(function (result) {
                //             if (result.message) {
                //                 $scope.error = result.message;
                //                 return $q.reject("Invite is invalid");
                //             }
                //             $scope.member.companyName = result.companyName;
                //             $scope.member.email = result.email;
                //         });
                // });
            }
        };

        $scope.submit = function () {
            $scope.errors = null;
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
                populateRegionalDataForAddress(member.address);
                //member.address.name = addressService.stringify(member.address);

                $ctrl.loader.wrapLoading(function () {
                    return accountApi.registerNewUser(member).then(function(result) {
                        if (!result.data.succeeded) {
                            var errors = _.map(result.data.errors, function(currentObject) {
                                return currentObject["description"];
                            });    
                            $scope.errors = errors;
                        } else {
                            $scope.outerRedirect($scope.baseUrl);
                        }
                    });
                    // var urlParam, apiMethodToCall;
                    // if (member.invite) {
                    //     urlParam = { invite: member.invite };
                    //     apiMethodToCall = corporateRegisterApi.registerByInvite;
                    // } else {
                    //     apiMethodToCall = $scope.isOrg() ? accountService.registerNewUser : corporateRegisterApi.registerPersonal;
                    // }

                    // return apiMethodToCall(urlParam, member, function (result) {
                    //     $scope.$parent.userName = member.username;
                    //     $scope.$parent.password = member.password;
                    //     $scope.login();
                    // }, function (rejection) {
                    //     vcRecaptchaService.reload();
                    //     corporateApiErrorHelper.handleErrors($scope, rejection);
                    // }).$promise;
                });
            }
        }

        $scope.setForm = function (form) { $ctrl.formScope = form; };

        $scope.finishedWizard = function() {
            $ctrl.finished = !$scope.create_customer.$invalid;
            return $ctrl.finished;
        };

        $scope.exitValidation = function(){
            var sc = $scope;
            return true;
        }

    }]);
