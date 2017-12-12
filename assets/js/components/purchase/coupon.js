var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCoupon', {
	templateUrl: "themes/assets/js/components/purchase/coupon.tpl.liquid",
	bindings: {
        coupon: '=',
        loader: '=',
		onApplyCoupon: '&',
		onRemoveCoupon: '&'
	},
	controller: ['loadingIndicatorService', function (loader) {
        var $ctrl = this;
        
	    $ctrl.loader = loader;
	}]
});
