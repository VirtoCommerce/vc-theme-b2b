//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', 'ngComponentRouter', /*'credit-cards', */'pascalprecht.translate', 'ngSanitize', 'satellizer', 'storefrontApp', 'storefrontApp.consts'])

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
        controller: ['$scope', '$timeout', 'storefront.accountApi', 'storefrontApp.mainContext', 'authService', 'storefront.corporateAccountApi', 'loadingIndicatorService', function ($scope, $timeout, accountApi, mainContext, authService, corporateAccountApi, loader) {
            var $ctrl = this;
            $ctrl.loader = loader;

            $ctrl.getQuotes = function (pageNumber, pageSize, sortInfos, callback) {
                loader.wrapLoading(function () {
                    return accountApi.getQuotes({ pageNumber: pageNumber, pageSize: pageSize, sortInfos: sortInfos }, callback).$promise;
                });
            };

            $ctrl.updateProfile = function (updateRequest) {
                loader.wrapLoading(function () {
                    return accountApi.updateAccount(updateRequest, mainContext.getCustomer).$promise;
                });
            };

            $ctrl.updateAddresses = function (data) {
                return loader.wrapLoading(function () {
                    return accountApi.updateAddresses(data, mainContext.getCustomer).$promise;
                });
            };

            $ctrl.availCountries = accountApi.getCountries();

            $ctrl.getCountryRegions = function (country) {
                return accountApi.getCountryRegions(country).$promise;
            };

            $ctrl.changePassword = function (changePasswordData) {
                return loader.wrapLoading(function () {
                    return accountApi.changePassword(changePasswordData).$promise;
                });
            };

            $scope.$watch(function () {
                return mainContext.customer;
            }, function (customer) {
                if (customer) {
                    loader.wrapLoading(function () {
                        return corporateAccountApi.getCompanyMember({ id: customer.id, memberType: 'CompanyMember' }, function (member) {
                            customer.companyId = _.first(member.organizations);
                            customer.email = _.first(member.emails);
                        }).$promise;
                    });
                    authService.fillAuthData();
                }
            });

            $scope.$on('loginStatusChanged', function () {
                $timeout(function () {
                    $(".nav *:hidden").parent().prev().find(".nav-title").hide();
                });
            });
        }]
    })

    .service('confirmService', ['$q', function ($q) {
        this.confirm = function (message) {
            return $q.when(window.confirm(message || 'Is it OK?'));
        };
    }])

