var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcTotals', {
    templateUrl: "themes/assets/js/purchase/totals.tpl.liquid",
	bindings: {
        order: '<',
        isReview: '@',
        isComplete: '@'
	}
});
