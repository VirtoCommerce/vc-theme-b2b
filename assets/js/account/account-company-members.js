angular.module('storefront.account')
.component('vcAccountCompanyMembers', {
    templateUrl: "themes/assets/account-company-members.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'MemberList', component: 'vcAccountCompanyMembersList', useAsDefault: true },
     { path: '/:member', name: 'MemberDetail', component: 'vcAccountCompanyMemberDetail' }
    ],
    controller: ['storefront.accountApi', function (accountApi) {
        var $ctrl = this;
    }]
})

.component('vcAccountCompanyMembersList', {
    templateUrl: "account-company-members-list.tpl",
    controller: ['storefrontApp.mainContext', 'storefront.corporateAccountApi', 'loadingIndicatorService', 'confirmService', '$translate', function (mainContext, corporateAccountApi, loader, confirmService, $translate) {
        var $ctrl = this;
        $ctrl.newMemberComponent = null;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        $ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMembers({
                    memberId: mainContext.customer.companyId,
                    skip: ($ctrl.pageSettings.currentPage - 1) * $ctrl.pageSettings.itemsPerPageCount,
                    take: $ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: $ctrl.sortInfos
                }, function (data) {
                    $ctrl.entries = data.results;
                    $ctrl.pageSettings.totalItems = data.totalCount;
                }).$promise;
            });
        };

        this.$routerOnActivate = function (next) {
            $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
            $ctrl.pageSettings.pageChanged();
        };

        $ctrl.addNewMember = function () {
            if ($ctrl.newMemberComponent.validate()) {
                $ctrl.newMember.organizations = [];
                $ctrl.newMember.organizations.push(mainContext.customer.companyId);

                $ctrl.updateCompanyMember($ctrl.newMember).then($ctrl.cancel).then(function () {
                    $ctrl.pageSettings.currentPage = 1;
                    $ctrl.pageSettings.pageChanged();
                });
            }
        };

        $ctrl.updateCompanyMember = function (companyMember) {
            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember(companyMember).$promise;
            });
        };

        $ctrl.cancel = function () {
            $ctrl.newMember = null;
        };

        $ctrl.changeStatus = function (memberId) {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMember({ id: memberId }, function (member) {
                    member.isActive = !member.isActive;
                    $ctrl.updateCompanyMember(member).then($ctrl.pageSettings.pageChanged);
                }).$promise;
            });
        };

        $ctrl.delete = function (memberId) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        //$ctrl.company.addresses.splice($index, 1);
                        //$ctrl.updateCompanyInfo($ctrl.company);
                    }
                });
            };

            $translate('customer.edit_company_members.delete_confirm').then(showDialog, showDialog);
        };
    }]
})

.component('vcAccountCompanyMemberDetail', {
    templateUrl: "account-company-members-detail.tpl",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefront.corporateAccountApi', '$rootScope', '$window', 'loadingIndicatorService', 'confirmService', function (corporateAccountApi, $rootScope, $window, loader, confirmService) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.memberComponent = null;

        var loadPromise;

        function refresh() {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMember({ id: $ctrl.memberNumber }, function (member) {
                    $ctrl.member = member;
                }).$promise;
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.memberNumber = next.params.member;

            refresh();
        };

        $ctrl.submitMember = function () {
            if ($ctrl.memberComponent.validate()) {
                loader.wrapLoading(function () {
                    return corporateAccountApi.updateCompanyMember($ctrl.member).$promise;
                });
            }
        };
    }]
});
