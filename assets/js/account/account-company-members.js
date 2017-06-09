angular.module('storefront.account')
.component('vcAccountCompanyMembers', {
    templateUrl: "themes/assets/js/account/account-company-members.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'MemberList', component: 'vcAccountCompanyMembersList', useAsDefault: true }
     //,{ path: '/:member', name: 'MemberDetail', component: 'vcAccountCompanyMemberDetail' }
    ],
    controller: ['storefront.accountApi', function (accountApi) {
        var $ctrl = this;
    }]
})

.component('vcAccountCompanyMembersList', {
    templateUrl: "account-company-members-list.tpl",
    controller: ['storefront.accountApi', 'loadingIndicatorService', function (accountApi, loader) {
        var ctrl = this;
        ctrl.loader = loader;
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return accountApi.getOrganizationMembers({
                    pageNumber: ctrl.pageSettings.currentPage,
                    pageSize: ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: ctrl.sortInfos
                }, function (data) {
                    ctrl.entries = data.results;
                    ctrl.pageSettings.totalItems = data.totalCount;
                }).$promise;
            });
        };

        this.$routerOnActivate = function (next) {
            ctrl.pageSettings.currentPage = next.params.pageNumber || ctrl.pageSettings.currentPage;
            ctrl.pageSettings.pageChanged();
        };
    }]
});
