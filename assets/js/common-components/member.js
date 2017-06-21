var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMember', {
    templateUrl: "themes/assets/js/common-components/member.tpl.html",
    bindings: {
        member: '=',
        //addresses: '<',
        //countries: '=',
        memberComponent: '=',
        //getCountryRegions: '&',
        //editMode: '<',
        onUpdate: '&'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;

        this.$onInit = function () {
            
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            
            $ctrl.memberComponent = null;
        };

        function populateMemberData(member) {
            if (member) {
                //address.country = _.findWhere(ctrl.countries, { code3: address.countryCode });
                //if (address.country != null) {
                //    ctrl.address.countryName = ctrl.address.country.name;
                //    ctrl.address.countryCode = ctrl.address.country.code3;
                //}

                //if (address.country) {
                //    if (address.country.regions) {
                //        setAddressRegion(address, address.country.regions);
                //    }
                //    else {
                //        ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                //            address.country.regions = regions;
                //            setAddressRegion(address, regions);
                //        });
                //    }
                //}
            }
        }

        //function setAddressRegion(address, regions) {
        //    address.region = _.findWhere(regions, { code: address.regionId });
        //    if (address.region) {
        //        ctrl.address.regionId = ctrl.address.region.code;
        //        ctrl.address.regionName = ctrl.address.region.name;
        //    }
        //    else {
        //        ctrl.address.regionId = undefined;
        //        ctrl.address.regionName = undefined;
        //    }
        //}

        $ctrl.setForm = function (frm) { $ctrl.form = frm; };

        $ctrl.validate = function () {
            
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };

        

        $scope.$watch('$ctrl.member', function () {
            
            if ($ctrl.member) {
                populateMemberData($ctrl.member);
                //ctrl.address.name = stringifyAddress(ctrl.address);
            }
            $ctrl.onUpdate({ member: $ctrl.member });
        }, true);

    }]
});
