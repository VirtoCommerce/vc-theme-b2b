var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcItemAvailability', {
    templateUrl: "themes/assets/js/common-components/item-availability.tpl.html",
    bindings: {
        availability: "<"
    },
    controller: [function() {
        var $ctrl = this;       
    }]
});
