angular.module('storefront.account')
.component('vcAccountSubscriptions', {
    templateUrl: "themes/assets/js/account/account-subscriptions.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'SubscriptionList', component: 'vcAccountSubscriptionsList', useAsDefault: true },
     { path: '/:number', name: 'SubscriptionDetail', component: 'vcAccountSubscriptionDetail' }
    ]
})

.component('vcAccountSubscriptionsList', {
    templateUrl: "account-subscriptions-list.tpl",
    controller: ['accountApi', 'confirmService', 'loadingIndicatorService', '$translate', function (accountApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        $ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return accountApi.searchUserSubscriptions({
                    pageNumber: $ctrl.pageSettings.currentPage,
                    pageSize: $ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: $ctrl.sortInfos
                }).then(function (response) {
                    $ctrl.entries = response.data.results;
                    $ctrl.pageSettings.totalItems = response.data.totalCount;
                });
            });
        };

        this.$routerOnActivate = function (next) {
            $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
            $ctrl.pageSettings.pageChanged();
        };
    }]
})

.component('vcAccountSubscriptionDetail', {
    templateUrl: "account-subscription-detail.tpl",
    controller: ['accountApi', 'confirmService', 'loadingIndicatorService', '$translate', function (accountApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;

        function refresh() {
            loader.wrapLoading(function () {
                return accountApi.getUserSubscription({ number: $ctrl.entryNumber }).then(function (response) {
                    $ctrl.subscription = angular.copy(response.data);
                });
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.entryNumber = next.params.number;

            refresh();
        };

        $ctrl.cancel = function () {
           
            loader.wrapLoading(function () {
                return accountApi.cancelUserSubscription({ number: $ctrl.entryNumber, cancelReason: $ctrl.cancelReason }).then(function (result) {
                    $ctrl.subscription = angular.copy(result.data);
                    $ctrl.isCancelFormVisible = false;
                    refresh();
                });
            });               
        };
    }]
})

.filter('toIntervalKey', function () {
    return function (data, data_intervalCount) {
        var retVal = 'customer.subscriptions.intervals.' + data.interval.toLowerCase() + '_' + (data_intervalCount === 1 ? 1 : 'plural');
        //var everyKey = 'customer.subscriptions.intervals.every';

        //$translate([intervalKey, everyKey]).then(function (translations) {
        //var intervalVal = translations[intervalKey];
        //  var everyVal = translations[everyKey];

        //if (data_intervalCount === 1) {
        //    retVal = intervalKey;
        //} else {
        //    retVal = data_intervalCount + intervalVal;
        //}
        //});

        return retVal;
    };
});
