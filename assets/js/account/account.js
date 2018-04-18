//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', 'ngComponentRouter', /*'credit-cards', */'pascalprecht.translate', 'ngSanitize', 'storefrontApp', 'storefrontApp.consts'])

    .config(['$translateProvider', 'baseUrl', function ($translateProvider, baseUrl) {
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
        $translateProvider.useUrlLoader(baseUrl + 'themes/localization.json');
        $translateProvider.preferredLanguage('en');
    }])

    .run(['$templateCache', 'apiBaseUrl', function ($templateCache, apiBaseUrl) {
        // cache application level templates
        $templateCache.put('pagerTemplate.html', '<uib-pagination boundary-links="true" max-size="$ctrl.pageSettings.numPages" items-per-page="$ctrl.pageSettings.itemsPerPageCount" total-items="$ctrl.pageSettings.totalItems" ng-model="$ctrl.pageSettings.currentPage" ng-change="$ctrl.pageSettings.pageChanged()" class="pagination-sm" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></uib-pagination>');
    }])

    .value('$routerRootComponent', 'vcAccountManager')
    .service('accountDialogService', ['$uibModal', function ($uibModal) {
        return {
            showDialog: function (dialogData, controller, templateUrl) {
                var modalInstance = $uibModal.open({
                    controller: controller,
                    templateUrl: templateUrl,
                    resolve: {
                        dialogData: function () {
                            return dialogData;
                        }
                    }
                });
            }
        }
    }])

    .component('vcAccountManager', {
        templateUrl: "account-manager.tpl",
        bindings: {
            baseUrl: '<',
            customer: '<'
        },
        $routeConfig: [
            { path: '/orders/...', name: 'Orders', component: 'vcAccountOrders' },
            { path: '/subscriptions/...', name: 'Subscriptions', component: 'vcAccountSubscriptions' },
            { path: '/quotes', name: 'Quotes', component: 'vcAccountQuotes' },
            { path: '/profile', name: 'Profile', component: 'vcAccountProfileUpdate', useAsDefault: true },
            { path: '/addresses', name: 'Addresses', component: 'vcAccountAddresses' },
            { path: '/changePassword', name: 'PasswordChange', component: 'vcAccountPasswordChange' },
            { path: '/companyInfo', name: 'CompanyInfo', component: 'vcAccountCompanyInfo' },
            { path: '/companyMembers/...', name: 'CompanyMembers', component: 'vcAccountCompanyMembers' },
            { path: '/lists/...', name: 'Lists', component: 'vcAccountLists' }
        ],
        controller: ['$scope', '$timeout', 'storefrontApp.mainContext', 'loadingIndicatorService', 'commonService', function ($scope, $timeout, mainContext, loader, commonService) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.availCountries = [];
            loader.wrapLoading(function() {
                return commonService.getCountries().then(function (response) {
                    $ctrl.availCountries = response.data;
                });
            });

            $ctrl.getCountryRegions = function (country) {
                return loader.wrapLoading(function() {
                    return commonService.getCountryRegions(country.code3).then(function (response) { return response.data; });
                });
            };
        }]
    })

    .service('confirmService', ['$q', function ($q) {
        this.confirm = function (message) {
            return $q.when(window.confirm(message || 'Is it OK?'));
        };
    }])

