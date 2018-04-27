var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutCoupon', {
    templateUrl: "themes/assets/js/checkout/checkout-coupon.tpl.html",
	bindings: {
        coupon: '=',
        loader: '=',
		onApplyCoupon: '&',
		onRemoveCoupon: '&'
	},
	controller: [function (loader) {
        var $ctrl = this;
	}]
});
