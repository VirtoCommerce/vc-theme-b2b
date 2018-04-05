var storefrontAppDependencies = [
    'ngStorage',
    'pascalprecht.translate',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'ngWizard',
    'vcRecaptcha',
    'satellizer',
    'storefrontApp.consts'
];
var storefrontApp = angular.module('storefrontApp', storefrontAppDependencies);

storefrontApp.factory('httpErrorInterceptor', [
    '$q', '$rootScope', function ($q, $rootScope) {
        var httpErrorInterceptor = {};

        httpErrorInterceptor.responseError = function (rejection) {
            if (rejection.data && rejection.data.message) {
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: [rejection.config.method, rejection.config.url, rejection.status, rejection.statusText, rejection.data.message].join(' '),
                    message: rejection.data.stackTrace
                });
            }
            return $q.reject(rejection);
        };
        httpErrorInterceptor.requestError = function (rejection) {
            if (rejection.data && rejection.data.message) {
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: [rejection.config.method, rejection.config.url, rejection.status, rejection.statusText, rejection.data.message].join(' '),
                    message: rejection.data.stackTrace
                });
            }
            return $q.reject(rejection);
        };

        return httpErrorInterceptor;
    }
]);

storefrontApp.factory('themeInterceptor', ['$q', 'baseUrl', function ($q, baseUrl) {
    var themeInterceptor = {};

    themeInterceptor.request = function (config) {
        if (config.url.startsWith('storefrontapi') || config.url.startsWith('themes')) {
            config.url = baseUrl + config.url;
        }
        return config || $q.when(config);
    };

    return themeInterceptor;
}
]);

storefrontApp.config(['$locationProvider', '$httpProvider', 'baseUrl', '$translateProvider', 'wizardConfigProviderProvider', 'vcRecaptchaServiceProvider', 'reCaptchaKey', function ($locationProvider, $httpProvider, baseUrl, $translateProvider, wizardConfigProvider, vcRecaptchaServiceProvider, reCaptchaKey) {
    //$locationProvider.html5Mode({ enabled: true, requireBase: false, rewriteLinks: false });
    $httpProvider.interceptors.push('httpErrorInterceptor');
    $httpProvider.interceptors.push('themeInterceptor');

    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useUrlLoader(baseUrl + 'themes/localization.json');
    $translateProvider.preferredLanguage('en');

    wizardConfigProvider.prevString = 'Back';
    wizardConfigProvider.nextString = 'Continue';
    wizardConfigProvider.submitString = 'Complete';

    vcRecaptchaServiceProvider.setSiteKey(reCaptchaKey);
}]);

storefrontApp.run(['$rootScope', '$window', function ($rootScope, $window) {
    $rootScope.print = function () {
        $window.print();
    };
}]);

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


angular.module('storefront.account')
.component('vcAccountAddresses', {
    templateUrl: "themes/assets/account-addresses.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', 'confirmService', '$translate', '$scope', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', function (mainContext, confirmService, $translate, $scope, corporateAccountApi, corporateApiErrorHelper, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;
        
        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    loader.wrapLoading(function() {
                        return corporateAccountApi.getCompanyMember({ id: customer.id }, function (member) {
                            $ctrl.currentMember = member;
                        }).$promise;
                    });
                }
            });

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.currentMember.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyMember($ctrl.currentMember);
            }
        };

        $ctrl.submit = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.currentMember.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyMember($ctrl.currentMember, $ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.currentMember.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.currentMember.addresses.splice($index, 1);
                        $ctrl.updateCompanyMember($ctrl.currentMember);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.updateCompanyMember = function (companyMember, handler) {
            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember(companyMember, handler, function (response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }).$promise;
            });
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountCompanyInfo', {
    templateUrl: "themes/assets/account-company-info.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', '$translate', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', 'confirmService', function (mainContext, $scope, $translate, corporateAccountApi, corporateApiErrorHelper, loader, confirmService) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $scope.$watch(
            function () { return mainContext.customer.companyId; },
            function (companyId) {
                if (companyId) {
                    loader.wrapLoading(function () {
                        return corporateAccountApi.getCompanyById({ id: companyId }, function (company) {
                            $ctrl.company = company;
                        }).$promise;
                    });
                }
            }
        );

        $ctrl.updateCompanyInfo = function (company) {
            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompany(company, function(response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }, function (rejection){
                    corporateApiErrorHelper.handleErrors($scope, rejection);
                }).$promise;
            });
        };

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.company.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyInfo($ctrl.company);
            }
        };

        $ctrl.submitCompanyAddress = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.company.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyInfo($ctrl.company).then($ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.company.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.company.addresses.splice($index, 1);
                        $ctrl.updateCompanyInfo($ctrl.company);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };
    }]
});

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
    bindings: { $router: '<' },
    controller: ['storefrontApp.mainContext', '$scope', 'storefront.corporateAccountApi', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'roleService', 'loadingIndicatorService', 'confirmService', '$location', '$translate', function (mainContext, $scope, corporateAccountApi, corporateRegisterApi, corporateApiErrorHelper, roleService, loader, confirmService, $location, $translate) {
        var $ctrl = this;
        $ctrl.currentMemberId = mainContext.customer.id;
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

                    $scope.$watch(function(){
                        return roleService.available;
                    }, function() {
                        angular.forEach($ctrl.entries, function(member){
                            var role = roleService.get(member.securityAccounts);
                            member.role = role ? role.name : null;
                        });
                    });
                }).$promise;
            });
        };
        
        $ctrl.addNewMemberFieldsConfig =[
            {
                field: 'CompanyName',
                disabled: true,
                visible: false,
                required: false
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: false,
                visible: true
            },
            {
                field: 'Password',
                disabled: false,
                visible:  true
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  true,
                required: true
            }
        ];
        
        $scope.init = function(storeId, cultureName, registrationUrl){
            $ctrl.storeId = storeId;
            $ctrl.cultureName = cultureName;
            $ctrl.registrationUrl = registrationUrl;
        };

        this.$routerOnActivate = function (next) {
            $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
        };

        $scope.$watch(
            function () { return mainContext.customer.companyId; },
            function (companyId) {
                if (companyId) {
                    $ctrl.pageSettings.pageChanged();
                }
            }
        );

        $ctrl.inviteEmailsValidationPattern = new RegExp(/((^|((?!^)([,;]|\r|\r\n|\n)))([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))+$/);
        $ctrl.invite = function () {
            $ctrl.inviteInfo.emails = $ctrl.inviteInfo.rawEmails.split(/[,;]|\r|\r\n|\n/g);
            loader.wrapLoading(function(){
              return corporateAccountApi.invite({
                storeId: $ctrl.storeId,
                companyId: mainContext.customer.companyId,
                emails: $ctrl.inviteInfo.emails,
                adminName: mainContext.customer.fullName,
                adminEmail: mainContext.customer.email,
                message: $ctrl.inviteInfo.message,
                language: $ctrl.cultureName,
                callbackUrl: $ctrl.registrationUrl
              }, function(response) {
                  $ctrl.cancel();
                  $ctrl.pageSettings.pageChanged();
                  corporateApiErrorHelper.clearErrors($scope);
              }, function (rejection) {
                  corporateApiErrorHelper.handleErrors($scope, rejection);
                }).$promise;
            });
        };

        $ctrl.addNewMember = function () {
            if ($ctrl.newMemberComponent.validate()) {
                $ctrl.newMember.companyId = mainContext.customer.companyId;
                $ctrl.newMember.role = $ctrl.newMember.role.name;
                $ctrl.newMember.storeId = $ctrl.storeId;

                loader.wrapLoading(function () {
                    return corporateRegisterApi.registerMember($ctrl.newMember, function(response) {
                        $ctrl.cancel();
                        $ctrl.pageSettings.currentPage = 1;
                        $ctrl.pageSettings.pageChanged();
                        corporateApiErrorHelper.clearErrors($scope);
                    }, function (rejection){
                        corporateApiErrorHelper.handleErrors($scope, rejection);
                    }).$promise;
                });
            }
        };

        $ctrl.cancel = function () {
            $ctrl.inviteInfo = null;
            $ctrl.newMember = null;
        };

        $ctrl.changeStatus = function (memberId) {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMember({ id: memberId }, function (member) {
                    member.isActive = !member.isActive;
                    loader.wrapLoading(function () {
                        return corporateAccountApi.updateCompanyMember(companyMember, function(response) {
                            $ctrl.pageSettings.pageChanged();
                            corporateApiErrorHelper.clearErrors($scope);
                        }, function (rejection){
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise;
                    });
                }).$promise;
            });
        };

        $ctrl.edit = function (memberId) {
            this.$router.navigate(['MemberDetail', {member: memberId, pageNumber: $ctrl.pageSettings.currentPage}]);
        }

        $ctrl.delete = function (memberId) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        loader.wrapLoading(function () {
                            return corporateAccountApi.deleteCompanyMember({ ids: memberId }, function(response) {
                                $ctrl.pageSettings.pageChanged();
                                corporateApiErrorHelper.clearErrors($scope);
                            }, function (rejection){
                                corporateApiErrorHelper.handleErrors($scope, rejection);
                            }).$promise;
                        });
                    }
                });
            };

            $translate('customer.edit_company_members.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.validate = function (){
            $ctrl.inviteForm.$setSubmitted();
            return $ctrl.inviteForm.valid;
        };

        $ctrl.showActions = function (member) {
            return member.id != mainContext.customer.id;
        }
    }]
})

.component('vcAccountCompanyMemberDetail', {
    templateUrl: "account-company-members-detail.tpl",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$rootScope', '$scope', '$window', 'roleService', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', 'confirmService', function ($q, $rootScope, $scope, $window, roleService, corporateAccountApi, corporateApiErrorHelper, loader, confirmService) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.fieldsConfig =[
            {
                field: 'CompanyName',
                disabled: true,
                visible: false,
                required: false
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: true,
                visible: false
            },
            {
                field: 'Password',
                disabled: true,
                visible: false
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  true
            }
        ];

        $ctrl.memberComponent = null;
        
        $scope.init = function(storeId){
            $ctrl.storeId = storeId;
        };

        function refresh() {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMember({ id: $ctrl.memberNumber }, function (member) {
                    $ctrl.member = {
                        id: member.id,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        email: _.first(member.emails),
                        organizations: member.organizations,
                        title: member.title,
                        securityAccounts: member.securityAccounts
                    };
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
                    $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
                    $ctrl.member.emails = [ $ctrl.member.email ];
                    return $q.all([
                        roleService.set($ctrl.member.securityAccounts, $ctrl.member.role),
                        corporateAccountApi.updateCompanyMember($ctrl.member, function(response) {
                            corporateApiErrorHelper.clearErrors($scope);
                        }, function (rejection){
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise
                    ]);
                });
            };
        };
    }]
});

 var storefrontApp = angular.module('storefrontApp');

 storefrontApp
 .controller('accountLoginController', ['$scope', 'authService', function ($scope, authService) {
     $scope.login = function ($event) {
         if (!$event || $event.keyCode === 13){
             var submit = function(){
                angular.element(document.querySelector('#customer_login')).submit();
            };
            // submit form even when error occurs
            authService.login($scope.userName, $scope.password).then(submit, submit);
         }
     };
 }]);
angular.module('storefront.account')
.component('vcAccountOrders', {
    templateUrl: "themes/assets/js/account/account-orders.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'OrderList', component: 'vcAccountOrdersList', useAsDefault: true },
     { path: '/:number', name: 'OrderDetail', component: 'vcAccountOrderDetail' }
    ],
    controller: ['orderHelper', function (orderHelper) {
        var $ctrl = this;
        $ctrl.orderHelper = orderHelper;
    }]
})

.component('vcAccountOrdersList', {
    templateUrl: "account-orders-list.tpl",
    controller: ['storefront.orderApi', 'loadingIndicatorService', function (orderApi, loader) {
        var ctrl = this;
        ctrl.loader = loader;
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return orderApi.search({
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
})

.component('vcAccountOrderDetail', {
    templateUrl: "account-order-detail.tpl",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefront.orderApi', '$rootScope', '$window', 'loadingIndicatorService', 'confirmService', 'orderHelper', function (orderApi, $rootScope, $window, loader, confirmService, orderHelper) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.hasPhysicalProducts = true;

        function refresh() {
            loader.wrapLoading(function () {
                $ctrl.order = orderApi.get({ number: $ctrl.orderNumber }, function (result) {
                    $ctrl.isShowPayment = false;
                    var lastPayment = _.last(_.sortBy($ctrl.order.inPayments, 'createdDate'));
                    $ctrl.billingAddress = (lastPayment && lastPayment.billingAddress) ||
                            _.findWhere($ctrl.order.addresses, { type: 'billing' }) ||
                            _.first($ctrl.order.addresses);
                    $ctrl.amountToPay = orderHelper.getNewPayment($ctrl.order).sum.amount;

                    if ($ctrl.amountToPay > 0) {
                        $ctrl.billingAddressEqualsShipping = true;
                        loadPromise = orderApi.getNewPaymentData({ number: $ctrl.orderNumber }, function (result) {
                            //$ctrl.order = result.order;
                            configurePayment(result.paymentMethods, result.payment);
                        }).$promise;
                    }
                });
                return $ctrl.order.$promise;
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.orderNumber = next.params.number;

            refresh();
        };

        $ctrl.getInvoicePdf = function () {
            var url = $window.BASE_URL + 'storefrontapi/orders/' + $ctrl.orderNumber + '/invoice';
            $window.open(url, '_blank');
        }

        $ctrl.showPayment = function () {
            loadPromise.then(function (result) {
                $ctrl.isShowPayment = true;
            });
        };

        var loadPromise;
        $ctrl.getAvailPaymentMethods = function () {
            return loadPromise.then(function (result) {
                var preselectedMaymentMethod;
                if ($ctrl.payment.gatewayCode) {
                    preselectedMaymentMethod = _.findWhere(result.paymentMethods, { code: $ctrl.payment.gatewayCode });
                }

                return preselectedMaymentMethod ? [preselectedMaymentMethod] : result.paymentMethods;
            });
        };

        $ctrl.selectPaymentMethod = function (paymentMethod) {
            angular.extend($ctrl.payment, paymentMethod);
            $ctrl.payment.gatewayCode = paymentMethod.code;
            // $ctrl.payment.sum = angular.copy($ctrl.order.total);
            // $ctrl.payment.sum.amount += paymentMethod.totalWithTax.amount;

            $ctrl.validate();
        };

        $ctrl.validate = function () {
            $ctrl.isValid = $ctrl.payment &&
                $ctrl.payment.gatewayCode &&
                $ctrl.payment.sum && $ctrl.payment.sum.amount > 0 &&
                _.every(components, function (x) {
                    return typeof x.validate !== "function" || x.validate();
                });

            return $ctrl.isValid;
        };

        $ctrl.submit = function () {
            if ($ctrl.validate()) {
                loader.wrapLoading(function () {
                    $ctrl.payment.bankCardInfo = $ctrl.paymentMethod.card;
                    return orderApi.addOrUpdatePayment({ number: $ctrl.orderNumber }, $ctrl.payment, function (payment) {
                        orderApi.processPayment({ number: $ctrl.orderNumber, paymentNumber: payment.number }, $ctrl.paymentMethod.card, function (result) {
                            var orderProcessingResult = result.orderProcessingResult;
                            var paymentMethod = result.paymentMethod;

                            if (!orderProcessingResult.isSuccess) {
                                $rootScope.$broadcast('storefrontError', {
                                    type: 'error',
                                    title: ['Error in new payment processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                                    message: orderProcessingResult.error,
                                });
                                return;
                            }

                            if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() === 'preparedform' && orderProcessingResult.htmlForm) {
                                outerRedirect($ctrl.accountManager.baseUrl + 'cart/checkout/paymentform?orderNumber=' + $ctrl.orderNumber);
                            } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() === 'redirection' && orderProcessingResult.redirectUrl) {
                                outerRedirect(orderProcessingResult.redirectUrl);
                            } else {
                                if ($ctrl.accountManager.customer.isRegisteredUser) {
                                    refresh();
                                } else {
                                    outerRedirect($ctrl.accountManager.baseUrl + 'cart/thanks/' + $ctrl.orderNumber);
                                }
                            }
                        })
                    }).$promise;
                });
            }
        };

        $ctrl.cancel = function () {
            confirmService.confirm('Cancel this payment?').then(function (confirmed) {
                if (confirmed) {
                    loader.wrapLoading(function () {
                        return orderApi.cancelPayment({ number: $ctrl.orderNumber, paymentNumber: $ctrl.payment.number }, null, refresh).$promise;
                    });
                }
            });
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };

        function configurePayment(paymentMethods, newPaymentTemplate) {
            $ctrl.payment = orderHelper.getNewPayment($ctrl.order, paymentMethods, newPaymentTemplate);
            $ctrl.payment.purpose = $ctrl.payment.purpose || 'Repeated payment';
            $ctrl.amountToPay = $ctrl.payment.sum.amount;

            $ctrl.canCancelPayment = $ctrl.payment.id !== newPaymentTemplate.id;
            if ($ctrl.canCancelPayment) {
                $ctrl.selectPaymentMethod(_.findWhere(paymentMethods, { code: $ctrl.payment.gatewayCode }));
            }

            if (!_.some($ctrl.order.shipments)) {
                $ctrl.hasPhysicalProducts = false;
                $ctrl.billingAddressEqualsShipping = false;
            }
        }

        function outerRedirect(absUrl) {
            $window.location.href = absUrl;
        };
    }]
})

.factory('orderHelper', function () {
    var retVal = {
        getNewPayment: function (order, paymentMethods, newPaymentTemplate) {
            var retVal;
            var paidPayments = _.filter(order.inPayments, function (x) {
                return x.status === 'Paid';
            });
            var paidAmount = _.reduce(paidPayments, function (memo, num) { return memo + num.sum.amount; }, 0);
            var amountToPay = order.total.amount - paidAmount;

            var pendingPayments = _.filter(order.inPayments, function (x) {
                return !x.isCancelled &&
                        (x.status === 'New' || x.status === 'Pending') &&
                        x.sum.amount > 0; // && x.sum.amount === amountToPay;
            });
            var pendingPayment = _.last(_.sortBy(pendingPayments, 'createdDate'));
            if (pendingPayment && (!paymentMethods || _.findWhere(paymentMethods, { code: pendingPayment.gatewayCode }))) {
                retVal = pendingPayment;
            } else {
                newPaymentTemplate = newPaymentTemplate || { sum: {} };
                newPaymentTemplate.sum.amount = amountToPay;
                retVal = newPaymentTemplate;
            }

            return retVal;
        }
    };

    return retVal;
})

.filter('orderToSummarizedStatusLabel', ['orderHelper', function (orderHelper) {
    return function (order) {
        var retVal = order.status || 'New';

        var found = _.findWhere(orderHelper.statusLabels, { status: retVal.toLowerCase() });
        if (found) {
            retVal = found.label;
        }

        return retVal;
    };
}])
;

angular.module('storefront.account')
.component('vcAccountPasswordChange', {
    templateUrl: "themes/assets/js/account/account-password-change.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['loadingIndicatorService', function (loader) {
        var ctrl = this;
        ctrl.loader = loader;
        ctrl.passwordChangeData = {};

        ctrl.submit = function () {
            // validation
            ctrl.errors = null;
            ctrl.error = {};
            var hasError = false;
            var errorMsg;

            errorMsg = ctrl.passwordChangeData.oldPassword === ctrl.passwordChangeData.newPassword;
            ctrl.error.newPassword = errorMsg
            hasError = hasError || errorMsg;

            if (!hasError) {
                errorMsg = ctrl.passwordChangeData.newPassword !== ctrl.passwordChangeData.newPassword2;
                ctrl.error.newPassword2 = errorMsg;
                hasError = hasError || errorMsg;
            }

            if (!hasError) {
                ctrl.accountManager.changePassword(ctrl.passwordChangeData).then(function (result) {
                    angular.extend(ctrl, result);
                    ctrl.passwordChangeData = {};
                    ctrl.form.$setPristine();
                });
            }
        };

        ctrl.setForm = function (frm) { ctrl.form = frm; };
    }]
});

angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', function ($q, $scope, mainContext, corporateAccountApi, corporateApiErrorHelper, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    loader.wrapLoading(function() {
                        return corporateAccountApi.getCompanyMember({ id: customer.id }, function(member) {
                            $ctrl.member = {
                                id: member.id,
                                firstName: member.firstName,
                                lastName: member.lastName,
                                email: _.first(member.emails),
                                organizations: member.organizations,
                                title: member.title,
                                addresses: member.addresses,
                                securityAccounts: member.securityAccounts
                            };
                        }).$promise;
                    });
                }
            });

        $ctrl.submit = function () {
            $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
            $ctrl.member.emails = [$ctrl.member.email];

            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember($ctrl.member, function(response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }, function (rejection){
                    corporateApiErrorHelper.handleErrors($scope, rejection);
                }).$promise;
            });
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountQuotes', {
    templateUrl: "themes/assets/js/account/account-quotes.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: [function () {
        var ctrl = this;
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            ctrl.accountManager.getQuotes(ctrl.pageSettings.currentPage, ctrl.pageSettings.itemsPerPageCount, ctrl.sortInfos, function (data) {
                ctrl.entries = data.results;
                ctrl.pageSettings.totalItems = data.totalCount;
            });
        };
        
        this.$routerOnActivate = function (next) {
            ctrl.pageSettings.currentPage = next.params.pageNumber || ctrl.pageSettings.currentPage;
            ctrl.pageSettings.pageChanged();
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'storefront.accountApi', 'loadingIndicatorService', 'vcRecaptchaService',
    function ($q, $scope, mainContext, corporateRegisterApi, corporateApiErrorHelper, accountApi, loader, vcRecaptchaService) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.countries = accountApi.getCountries();

        $scope.isOrg = function () {
            return $scope.member.type === 'Business';
        };

        $scope.$watch('member.address.countryCode', function () {
            if ($scope.member.address.countryCode) {
                populateRegionalDataForAddress($scope.member.address);
                $scope.member.address.name = stringifyAddress($scope.member.address);
            }
        });

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere($ctrl.countries, { code3: address.countryCode });
                if (address.country) {
                    address.countryName = address.country.name;
                    address.countryCode = address.country.code3;

                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        //$ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                        accountApi.getCountryRegions(address.country, function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                address.regionId = address.region.code;
                address.regionName = address.region.name;
            }
            else {
                address.regionId = undefined;
                address.regionName = undefined;
            }
        }

        function stringifyAddress(address) {
            var addressType = '';

            //var type = _.find($ctrl.types, function (i) { return i.id == $ctrl.address.addressType });
            //if (type)
            //    addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.companyName ? address.companyName + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        //$scope.registerMemberFieldsConfig = [
        //    {
        //        field: 'CompanyName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Email',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'UserName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Password',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    }
        //];

        function getParams() {
            var params = window.location.search.substring(1).split("&"), result = {}, param, i;
            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    if (params[i] === "") continue;

                    param = params[i].split("=");
                    result[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
                }
            }
            return result;
        }

        $scope.init = function (storeId) {
            $scope.member = { storeId: storeId, type: 'Business', address: {}, email: null };
            var invite = getParams().invite;
            if (invite) {
                //$scope.registerMemberFieldsConfig[0] = {
                //    field: 'CompanyName',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};
                //$scope.registerMemberFieldsConfig[1] = {
                //    field: 'Email',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};

                $scope.member.invite = invite;
                $ctrl.loader.wrapLoading(function () {
                    return corporateRegisterApi.getRegisterInfoByInvite({ invite: invite }).$promise
                        .then(function (result) {
                            if (result.message) {
                                $scope.error = result.message;
                                return $q.reject("Invite is invalid");
                            }
                            $scope.member.companyName = result.companyName;
                            $scope.member.email = result.email;
                        });
                });
            }
            
        };

        $scope.submit = function () {
            //TODO: Find another solution to submit form without this
            angular.element(document.querySelector('#create_customer')).submit();
        }
    }]);

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
    controller: ['storefront.subscriptionApi', 'confirmService', 'loadingIndicatorService', '$translate', function (subscriptionApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        $ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return subscriptionApi.search({
                    pageNumber: $ctrl.pageSettings.currentPage,
                    pageSize: $ctrl.pageSettings.itemsPerPageCount,
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
    }]
})

.component('vcAccountSubscriptionDetail', {
    templateUrl: "account-subscription-detail.tpl",
    controller: ['storefront.subscriptionApi', 'confirmService', 'loadingIndicatorService', '$translate', function (subscriptionApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;

        function refresh() {
            loader.wrapLoading(function () {
                return subscriptionApi.get({ number: $ctrl.entryNumber }, function (result) {
                    $ctrl.subscription = angular.copy(result);
                }).$promise;
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.entryNumber = next.params.number;

            refresh();
        };

        $ctrl.cancel = function () {
            //var showDialog = function (text) {
            //    confirmService.confirm(text).then(function (confirmed) {
            //        if (confirmed) {
            loader.wrapLoading(function () {
                return subscriptionApi.cancel({ number: $ctrl.entryNumber }, { number: $ctrl.entryNumber, cancelReason: $ctrl.cancelReason }, function (result) {
                    $ctrl.subscription = angular.copy(result);
                    $ctrl.isCancelFormVisible = false;
                }).$promise;
            });
            //        }
            //    });
            //};
            //$translate('customer.subscription.cancel_confirmation').then(showDialog, showDialog);
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
})
;
angular.module('storefront.account')
    .factory('storefront.accountApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/account', null, {
            updateAccount: { url: 'storefrontapi/account', method: 'POST' },
            changePassword: { url: 'storefrontapi/account/password', method: 'POST' },
            getQuotes: { url: 'storefrontapi/account/quotes' },
            updateAddresses: { url: 'storefrontapi/account/addresses', method: 'POST' },
            getCountries: { url: 'storefrontapi/countries', isArray: true },
            getCountryRegions: { url: 'storefrontapi/countries/:code3/regions', isArray: true }
        });
    }])
    .factory('storefront.orderApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/orders/:number', null, {
            search: { url: 'storefrontapi/orders/search', method: 'POST' },
            getNewPaymentData: { url: 'storefrontapi/orders/:number/newpaymentdata' },
            addOrUpdatePayment: { url: 'storefrontapi/orders/:number/payments', method: 'POST' },
            processPayment: { url: 'storefrontapi/orders/:number/payments/:paymentNumber/process', method: 'POST' },
            cancelPayment: { url: 'storefrontapi/orders/:number/payments/:paymentNumber/cancel', method: 'POST' }
        });
    }])
    .factory('storefront.subscriptionApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/subscriptions/:number', null, {
            search: { url: 'storefrontapi/subscriptions/search', method: 'POST' },
            cancel: { url: 'storefrontapi/subscriptions/:number/cancel', method: 'POST' }
        });
    }]);
angular.module('storefront.account')
.factory('storefront.corporateAccountApi', ['$resource', 'apiBaseUrl', function ($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + 'api/b2b/companyMembers', {}, {
        getCompanyById: { url: apiBaseUrl + 'api/b2b/company/:id' },
        updateCompany: { url: apiBaseUrl + 'api/b2b/company', method: 'POST' },

        getCompanyMembers: { url: apiBaseUrl + 'api/b2b/companyMembers', method: 'POST' },
        getCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMember/:id' },
        updateCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMember', method: 'POST' },
        deleteCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMembers', method: 'DELETE' },

        invite: { url: apiBaseUrl + 'api/b2b/invite', method: 'POST' },

        getUser: { url: apiBaseUrl + 'api/b2b/users/:userName' },
        updateUser: { url: apiBaseUrl + 'api/b2b/users', method: 'PUT' },
        getRoles: { url: apiBaseUrl + 'api/b2b/roles', isArray: true }
    });
}])
.factory('storefront.corporateRegisterApi', ['$resource', 'apiBaseUrl', function ($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + 'api/b2b/register', {}, {
        register: { method: 'POST' },
        registerMember: { url: apiBaseUrl + 'api/b2b/registerMember', method: 'POST' },
        getRegisterInfoByInvite: { url: apiBaseUrl + 'api/b2b/registerMember/:invite' },
        registerByInvite: { url: apiBaseUrl + 'api/b2b/registerMember/:invite', method: 'POST' },
        registerPersonal: { url: apiBaseUrl + 'api/b2b/registerPersonal', method: 'POST' }
    });
}])
.factory('storefront.corporateApiErrorHelper', ['$rootScope', function ($rootScope) {
    return {
        clearErrors: function($scope) {
            $scope.errorMessage = null;
            $scope.errors = null;
        },
        handleErrors: function ($scope, rejection) {
            if (rejection.status == 400) {
                $scope.errorMessage = rejection.data.message;
                $scope.errors = rejection.data.modelState;
                $rootScope.closeNotification();
            }
        }
    };
}]);

angular.module('storefront.account')
.factory('roleService', ['$q', '$http', 'storefront.corporateAccountApi', 'availableRoles', function ($q, $http, corporateAccountApi, availableRoles) {
    var service = {
        available: null,
        get: null,
        set: null
    };

    // get all available roles from settings
    service._roles = availableRoles;
    corporateAccountApi.getRoles(function (roles) {
        service.available = _.map(service._roles, function(role) {
            var realRole = _.findWhere(roles, { name: role });
            return angular.extend({}, realRole, { description: 'customer.roles.descriptions.' + role.toLowerCase().replace(" ", "_") });
        });
    });

    service.get = function(accounts){
        var availableRoles = angular.copy(service.available);
        _.each(availableRoles, function(availableRole) {            
            // role is assigned to member if any of member's security accounts has this role assigned
            var roles = _.chain(accounts).map(function(account) { return account.roles; }).flatten().value();
            availableRole.assigned = _.some(roles,
            function(assignedRole) {
                return availableRole.name === assignedRole.name;
            });
        });
        // if multiple roles assigned, return the role with minimal privilidges
        return _.last(_.where(availableRoles, { assigned: true }));
    };

    service.set = function(accounts, role) {
        // assign current role to all member's security accounts
        return $q.all(_.map(accounts, function(account) {
            account.roles = _.without.apply(_, [account.roles].concat(_.filter(account.roles, function(role) { return _.contains(service._roles, role.name); })));
            account.roles.push(role);
            return corporateAccountApi.updateUser(account).$promise;
        }));
    };

    return service;
}]);

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcAddress', {
    templateUrl: "themes/assets/address.tpl.html",
    bindings: {
        address: '=',
        addresses: '<',
        countries: '=',
        validationContainer: '=',
        getCountryRegions: '&',
        editMode: '<',
        onUpdate: '&'
    },
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    transclude: {
        header: '?addressHeader', footer: '?addressFooter'
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;
        ctrl.types = [{ id: 'Billing', name: 'Billing' }, { id: 'Shipping', name: 'Shipping' }, { id: 'BillingAndShipping', name: 'Billing and Shipping' }];
        
        this.$onInit = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere(ctrl.countries, { code3: address.countryCode });
                if (address.country != null) {
                    ctrl.address.countryName = ctrl.address.country.name;
                    ctrl.address.countryCode = ctrl.address.country.code3;
                }

                if (address.country) {
                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                ctrl.address.regionId = ctrl.address.region.code;
                ctrl.address.regionName = ctrl.address.region.name;
            }
            else {
                ctrl.address.regionId = undefined;
                ctrl.address.regionName = undefined;
            }
        }

        ctrl.setForm = function (frm) { ctrl.form = frm; };

        ctrl.validate = function () {
            if (ctrl.form) {
                ctrl.form.$setSubmitted();
                return ctrl.form.$valid;
            }
            return true;
        };

        function stringifyAddress(address) {
            var addressType = '';

            var type = _.find(ctrl.types, function (i) { return i.id == ctrl.address.addressType });
            if (type)
                addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.$watch('$ctrl.address', function () {
            if (ctrl.address) {
                populateRegionalDataForAddress(ctrl.address);
                ctrl.address.name = stringifyAddress(ctrl.address);
            }
            ctrl.onUpdate({ address: ctrl.address });
        }, true);

    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCreditCard', {
    templateUrl: "themes/assets/js/common-components/creditCard.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        card: '=',
        validationContainer: '='
    },
    controller: ['$scope', '$filter', function ($scope, $filter) {
        var ctrl = this;

        this.$onInit = function () {
            if(ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        $scope.$watch('$ctrl.card.bankCardHolderName', function (val) {
            if (ctrl.card) {
                ctrl.card.bankCardHolderName = $filter('uppercase')(val);
            }
        }, true);

        ctrl.validate = function () {
            ctrl.form.$setSubmitted();
            return !ctrl.form.$invalid;
        }

    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcErrors', {
    templateUrl: "themes/assets/errors.tpl.html",
    bindings: {
        level: '<',
        message: '<',
        errors: '<'
    },
    controller: [function () {
        var $ctrl = this;
        $ctrl.level = $ctrl.level || 'danger';
    }]
});

angular.module('storefrontApp')

.component('vcLabeledInput', {
    templateUrl: "themes/assets/labeled-input.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        inputClass: '<',
        placeholder: '@',
        type: '@?',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        pattern: '@',
        disabled: '<'
    },
    controller: [function () {
        var $ctrl = this;
        
        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});

angular.module('storefrontApp')

.component('vcLabeledSelect', {
    templateUrl: "themes/assets/labeled-select.tpl.html",
    require: {
        ngModel: "?ngModel"
    },
    bindings: {
        options: '<',
        select: '&',
        form: '=',
        name: '@',
        placeholder: '<',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        disabled: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.$onInit = function() {
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$render = function() {
                $ctrl.value = $ctrl.ngModel.$viewValue;
            };
        };

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

        var select = $ctrl.select;
        $ctrl.select = function(option) {
            select(option);
            $ctrl.value = option;
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$setViewValue($ctrl.value);
        };        
    }]
});
angular.module('storefrontApp')

.component('vcLabeledTextArea', {
    templateUrl: "themes/assets/labeled-textarea.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        label: '@',
        required: '<',
        requiredError: '@?',
        pattern: '<?',
        autofocus: '<'
    },
    controller: [function () {
        var $ctrl = this;

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});
var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        items: '='
    }
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMember', {
    templateUrl: "themes/assets/member.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '='
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) { $ctrl.form = frm; };


        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMemberDetail', {
    templateUrl: "themes/assets/memberDetail.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '=',
        fieldsConfig: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.config = [
            {
                field: 'CompanyName',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: false,
                visible: true
            },
            {
                field: 'Password',
                disabled: false,
                visible: true
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  false
            }
        ];

        if ($ctrl.fieldsConfig)
            angular.extend($ctrl.config, $ctrl.fieldsConfig);

        $ctrl.rolesComponent = null;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) {
            $ctrl.form = frm;
        };

        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };

        $ctrl.showField = function (field) {
            return getFieldConfig(field).visible == true;
        }

        $ctrl.disableField = function (field) {
            return getFieldConfig(field).disabled == true;
        }

        $ctrl.requiredField = function (field) {
            return getFieldConfig(field).required == true;
        }

        function getFieldConfig(field) {
            var configItem = _.first(_.filter($ctrl.config, function (configItem) { return configItem.field === field; }));
            return configItem;
        }
    }]
});

storefrontApp.directive('confirmPasswordValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            ngModel.$parsers.unshift(function (value, scope) {
                var isValid = true;
                var password = ngModel.$$parentForm['customer[password]'].$viewValue;

                if (password) {
                    isValid = password === value;
                }

                ngModel.$setValidity('confirmPasswordValidation', isValid);
                return value;
            });
        }
    };
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentMethods', {
    templateUrl: "themes/assets/js/common-components/paymentMethods.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        getAvailPaymentMethods: '&',
        onSelectMethod: '&',
        paymentMethod: '=',
        validationContainer: '='
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;

        this.$onInit = function () {
            ctrl.getAvailPaymentMethods().then(function (methods) {
                ctrl.availPaymentMethods = _.sortBy(methods, function (x) { return x.priority; });
                if (ctrl.paymentMethod) {
                    ctrl.paymentMethod = _.findWhere(ctrl.availPaymentMethods, { code: ctrl.paymentMethod.code });
                }
                if (!ctrl.paymentMethod && ctrl.availPaymentMethods.length > 0) {
                    ctrl.selectMethod(ctrl.availPaymentMethods[0]);
                }
            })
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        ctrl.validate = function () {
            return ctrl.paymentMethod;
        }

        ctrl.selectMethod = function (method) {
            ctrl.paymentMethod = method;
            ctrl.onSelectMethod({ paymentMethod: method });
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcRoles', {
    templateUrl: "themes/assets/roles.tpl.html.liquid",
    bindings: {
        value: '=',
        accounts: "<",
        form: '=',
        name: "@",
        required: "<",
        disabled: "<"
    },
    controller: ['$scope', 'roleService', 'loadingIndicatorService', function ($scope, roleService, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $scope.$watch(function(){
            return roleService.available;
        }, function(){
            $ctrl.availableRoles = _.map(roleService.available, function(availableRole) {
                return availableRole;
            });
            $ctrl.getRole();
        });

        $ctrl.$onChanges = function() {
            $ctrl.getRole();
        };
        
        $ctrl.getRole = function() {
            if ($ctrl.accounts) {
                $ctrl.value = roleService.get($ctrl.accounts);
            }
        };

        $ctrl.selectRole = function(role){
            if ($ctrl.value)
                $ctrl.value.assigned = false;
            role.assigned = true;
        };
    }]
});
var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcSearchBar', {
    templateUrl: "themes/assets/js/common-components/searchBar.tpl.html",
    bindings: {
        placeholder: '<',
        searching: '<',
        noResults: '<',
        query: '@',
        categoriesLabel: '<',
        productsLabel: '<',
        submitLabel: '<',
        categoryLimit: '@',
        productLimit: '@'
    },
    controller: ['$scope', '$q', 'catalogService', function ($scope, $q, catalogService) {
        var $ctrl = this;
        $ctrl.hasHint = false;

        $scope.$watch('$ctrl.isOpen', function (isOpen) {
            $ctrl.hasHint = !!$ctrl.query && !isOpen;
        });

        $scope.$watch('$ctrl.query', function(query) {
            $ctrl.hasHint = !!query && !$ctrl.isOpen;
        });

        $ctrl.getSuggestions = function () {
            var searchCriteria = { keyword: $ctrl.query, start: 0 };
            return $q.all([
                catalogService.searchCategories(angular.extend({ }, searchCriteria, { pageSize: $ctrl.categoryLimit })),
                catalogService.search(angular.extend({ }, searchCriteria, { pageSize: $ctrl.productLimit }))
            ]).then(function(results) {
                var process = function(within) {
                    return (results[0].data[within] || results[1].data[within]).map(function (suggestion) {
                        suggestion['within'] = within;
                        return suggestion;
                    });
                }
                return process('categories').concat(process('products')).map(function (suggestion, index) {
                    suggestion['index'] = index;
                    return suggestion;
                });
            });
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutEmail', {
	templateUrl: "themes/assets/js/checkout/checkout-email.tpl.html",
	require: {
		checkoutStep: '^vcCheckoutWizardStep'
	},
	bindings: {
		email: '='
	},
	controller: [function () {
		var ctrl = this;

		this.$onInit = function () {
			ctrl.checkoutStep.addComponent(this);
		};

		this.$onDestroy = function () {
			ctrl.checkoutStep.removeComponent(this);
		};
	
		ctrl.validate = function () {
			ctrl.form.$setSubmitted();
			return !ctrl.form.$invalid;
		}

	}]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutShippingMethods', {
	templateUrl: "themes/assets/js/checkout/checkout-shippingMethods.tpl.liquid",
	require: {
		checkoutStep: '^vcCheckoutWizardStep'
	},
	bindings: {
		shipment: '=',
		getAvailShippingMethods: '&',
		onSelectShippingMethod: '&'
	},
	controller: [function () {

		var ctrl = this;
		
		ctrl.availShippingMethods = [];
		ctrl.selectedMethod = {};
		this.$onInit = function () {
			ctrl.checkoutStep.addComponent(this);
			ctrl.loading = true;
			ctrl.getAvailShippingMethods(ctrl.shipment).then(function (availMethods) {
				ctrl.availShippingMethods = availMethods;
				_.each(ctrl.availShippingMethods, function (x) {
					x.id = getMethodId(x);
				});
				ctrl.selectedMethod = _.find(ctrl.availShippingMethods, function (x) { return ctrl.shipment.shipmentMethodCode == x.shipmentMethodCode && ctrl.shipment.shipmentMethodOption == x.optionName });
				ctrl.loading = false;
			});
		};		
		
		this.$onDestroy = function () {
			ctrl.checkoutStep.removeComponent(this);
		};
			
		function getMethodId(method) {
			var retVal = method.shipmentMethodCode;
			if (method.optionName) {
				retVal += ':' + method.optionName;
			}
			return retVal;
		}

		ctrl.selectMethod = function (method) {
			ctrl.selectedMethod = method;
			ctrl.onSelectShippingMethod({ shippingMethod: method });
		};
	
		ctrl.validate = function () {
			ctrl.form.$setSubmitted();
			return !ctrl.form.$invalid;
		}
	}]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutWizardStep', {
    templateUrl: "themes/assets/js/checkout/checkout-wizard-step.tpl.html",
    transclude: true,
    require: {
        wizard: '^vcCheckoutWizard'
    },
    bindings: {
        name: '@',
        title: '@',
        stepDisabled: '=?',
        onNextStep: '&?',
        canEnter: '=?',
        final: '<?'
    },
    controller: [function () {
        var ctrl = this;
        ctrl.components = [];
        ctrl.canEnter = true;

        this.$onInit = function () {
            ctrl.wizard.addStep(this);
        };

        ctrl.addComponent = function (component) {
            ctrl.components.push(component);
        };
        ctrl.removeComponent = function (component) {
            ctrl.components = _.without(ctrl.components, component);
        };
        ctrl.validate = function () {
            return _.every(ctrl.components, function (x) { return typeof x.validate !== "function" || x.validate(); });
        }
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutWizard', {
	transclude: true,
	templateUrl: 'themes/assets/js/checkout/checkout-wizard.tpl.html',
	bindings: {
		wizard: '=',
		loading: '=',
		onFinish: '&?',
		onInitialized: '&?'
	},
	controller: ['$scope', function ($scope) {
		var ctrl = this;
		ctrl.wizard = ctrl;
		ctrl.steps = [];	
		ctrl.goToStep = function (step) {
			if (angular.isString(step))
			{
				step = _.find(ctrl.steps, function (x) { return x.name == step; });
			}
			if (step && ctrl.currentStep != step && step.canEnter) {
				if (!step.final) {
					step.isActive = true;
					if (ctrl.currentStep) {
						ctrl.currentStep.isActive = false;
					}
					ctrl.currentStep = step;
				}
				else if (ctrl.onFinish)
				{
					ctrl.onFinish();
				}
			}
		};

		ctrl.nextStep = function () {
			if (!ctrl.currentStep.validate || ctrl.currentStep.validate()) {
				if (ctrl.currentStep.nextStep) {
					if (ctrl.currentStep.onNextStep) {
						//evaluate onNextStep function
						var promise = ctrl.currentStep.onNextStep();
						//For promise function need to delay going to next step
						if (promise && angular.isFunction(promise.then)) {
							promise.then(function () {
								ctrl.goToStep(ctrl.currentStep.nextStep);
							});
						}
						else
						{
							ctrl.goToStep(ctrl.currentStep.nextStep);
						}
					}
					else {
						ctrl.goToStep(ctrl.currentStep.nextStep);
					}
				}			
			}
		};

		ctrl.prevStep = function () {
			ctrl.goToStep(ctrl.currentStep.prevStep);
		};

		function rebuildStepsLinkedList(steps) {
			var nextStep = undefined;
			for (var i = steps.length; i-- > 0;) {
				steps[i].prevStep = undefined;
				steps[i].nextStep = undefined;
				if (nextStep && !steps[i].disabled) {
					nextStep.prevStep = steps[i]
				};				
				if (!steps[i].disabled) {
					steps[i].nextStep = nextStep;
					nextStep = steps[i];
				}
			}		
		};
		
		ctrl.addStep = function (step) {
			ctrl.steps.push(step);
			$scope.$watch(function () { return step.disabled; }, function () {
				rebuildStepsLinkedList(ctrl.steps);			
			});
			rebuildStepsLinkedList(ctrl.steps);
			if(!ctrl.currentStep)
			{
				ctrl.goToStep(step);
			}
			if (step.final && ctrl.onInitialized)
			{
				ctrl.onInitialized();
			}
		};

	}]
});

//Call this to register our module to main application
var moduleName = "storefront.checkout";

if (storefrontAppDependencies != undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['credit-cards', 'angular.filter'])
.controller('checkoutController', ['$rootScope', '$scope', '$window', 'cartService',
    function ($rootScope, $scope, $window, cartService) {
        $scope.checkout = {
            wizard: {},
            paymentMethod: {},
            shipment: {},
            payment: {},
            coupon: {},
            availCountries: [],
            loading: false,
            isValid: false
        };

        $scope.validateCheckout = function (checkout) {
            checkout.isValid = checkout.payment && checkout.payment.paymentGatewayCode;
            if (checkout.isValid && !checkout.billingAddressEqualsShipping) {
                checkout.isValid = angular.isObject(checkout.payment.billingAddress);
            }
            if (checkout.isValid && checkout.cart && checkout.cart.hasPhysicalProducts) {
                checkout.isValid = angular.isObject(checkout.shipment)
                                && checkout.shipment.shipmentMethodCode
                                && angular.isObject(checkout.shipment.deliveryAddress);
            }
        };

        $scope.reloadCart = function () {
            return cartService.getCart().then(function (response) {
                var cart = response.data;
                if (!cart || !cart.id) {
                    $scope.outerRedirect($scope.baseUrl + 'cart');
                }
                else {
                    $scope.checkout.cart = cart;
                    if (cart.payments.length) {
                        $scope.checkout.payment = cart.payments[0];
                        $scope.checkout.paymentMethod.code = $scope.checkout.payment.paymentGatewayCode;
                    }
                    if (cart.shipments.length) {
                        $scope.checkout.shipment = cart.shipments[0];
                    }
                    $scope.checkout.billingAddressEqualsShipping = cart.hasPhysicalProducts && !angular.isObject($scope.checkout.payment.billingAddress);

                    $scope.checkout.canCartBeRecurring = $scope.customer.isRegisteredUser && _.all(cart.items, function (x) { return !x.isReccuring });
                    $scope.checkout.paymentPlan = cart.paymentPlan && _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: cart.paymentPlan.intervalCount, interval: cart.paymentPlan.interval }) ||
                                                                      _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
                }
                $scope.validateCheckout($scope.checkout);
                return cart;
            });
        };

        $scope.selectPaymentMethod = function (paymentMethod) {
            angular.extend($scope.checkout.payment, paymentMethod);
            $scope.checkout.payment.paymentGatewayCode = paymentMethod.code;
            $scope.checkout.payment.amount = angular.copy($scope.checkout.cart.total);
            $scope.checkout.payment.amount.amount += paymentMethod.totalWithTax.amount;

            updatePayment($scope.checkout.payment);
        };

        function getAvailCountries() {
            //Load avail countries
            return cartService.getCountries().then(function (response) {
                return response.data;
            });
        };

        $scope.getCountryRegions = function (country) {
            return cartService.getCountryRegions(country.code3).then(function (response) {
                return response.data;
            });
        };

        $scope.getAvailShippingMethods = function (shipment) {
            return wrapLoading(function () {
                return cartService.getAvailableShippingMethods(shipment.id).then(function (response) {
                    return response.data;
                });
            });
        }

        $scope.getAvailPaymentMethods = function () {
            return wrapLoading(function () {
                return cartService.getAvailablePaymentMethods().then(function (response) {
                    return response.data;
                });
            });
        };

        $scope.selectShippingMethod = function (shippingMethod) {
            if (shippingMethod) {
                $scope.checkout.shipment.shipmentMethodCode = shippingMethod.shipmentMethodCode;
                $scope.checkout.shipment.shipmentMethodOption = shippingMethod.optionName;
            }
            else {
                $scope.checkout.shipment.shipmentMethodCode = undefined;
                $scope.checkout.shipment.shipmentMethodOption = undefined;
            }
            $scope.updateShipment($scope.checkout.shipment);
        };

        $scope.updateShipment = function (shipment) {
            if (shipment.deliveryAddress) {
                $scope.checkout.shipment.deliveryAddress.type = 'Shipping';
            };
            //Does not pass validation errors to API
            shipment.validationErrors = undefined;
            return wrapLoading(function () {
                return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart);
            });
        };

        $scope.createOrder = function () {
            updatePayment($scope.checkout.payment).then(function () {
                $scope.checkout.loading = true;
                cartService.createOrder($scope.checkout.paymentMethod.card).then(function (response) {
                    var order = response.data.order;
                    var orderProcessingResult = response.data.orderProcessingResult;
                    var paymentMethod = response.data.paymentMethod;
                    handlePostPaymentResult(order, orderProcessingResult, paymentMethod);
                });
            });
        };

        $scope.savePaymentPlan = function () {
            wrapLoading(function () {
                return cartService.addOrUpdatePaymentPlan($scope.checkout.paymentPlan).then(function () {
                    $scope.checkout.cart.paymentPlan = $scope.checkout.paymentPlan;
                });
            });
        };

        $scope.isRecurringChanged = function (isRecurring) {
            if ($scope.checkout.paymentPlan) {
                if (isRecurring) {
                    $scope.savePaymentPlan();
                } else {
                    wrapLoading(function () {
                        return cartService.removePaymentPlan().then(function () {
                            $scope.checkout.cart.paymentPlan = undefined;
                        });
                    });
                }
            }
        };

        function updatePayment(payment) {
            if ($scope.checkout.billingAddressEqualsShipping) {
                payment.billingAddress = undefined;
            }

            if (payment.billingAddress) {
                payment.billingAddress.type = 'Billing';
            }
            return wrapLoading(function () {
                return cartService.addOrUpdatePayment(payment).then($scope.reloadCart);
            });
        }

        function handlePostPaymentResult(order, orderProcessingResult, paymentMethod) {
            if (!orderProcessingResult.isSuccess) {
                $scope.checkout.loading = false;
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: ['Error in new order processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                    message: orderProcessingResult.error,
                });
                return;
            }

            if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'preparedform' && orderProcessingResult.htmlForm) {
                $scope.outerRedirect($scope.baseUrl + 'cart/checkout/paymentform?orderNumber=' + order.number);
            } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'redirection' && orderProcessingResult.redirectUrl) {
                $window.location.href = orderProcessingResult.redirectUrl;
            } else {
                if (!$scope.customer.isRegisteredUser) {
                    $scope.outerRedirect($scope.baseUrl + 'cart/thanks/' + order.number);
                } else {
                    $scope.outerRedirect($scope.baseUrl + 'account#/orders/' + order.number);
                }
            }
        }

        function wrapLoading(func) {
            $scope.checkout.loading = true;
            return func().then(function (result) {
                $scope.checkout.loading = false;
                return result;
            },
                function () {
                    $scope.checkout.loading = false;
                });
        }

        $scope.initialize = function () {

            $scope.reloadCart().then(function (cart) {
                $scope.checkout.wizard.goToStep(cart.hasPhysicalProducts ? 'shipping-address' : 'payment-method');
            });
        };

        getAvailCountries().then(function (countries) {
            $scope.checkout.availCountries = countries;
        });

    }]);

angular.module('storefrontApp')
    .component('vcAccountLists', {
        templateUrl: "lists-manager.tpl",
        $routeConfig: [
            { path: '/', name: 'Lists', component: 'vcAccountLists' },
            { path: '/friendsLists', name: 'FriendsLists', component: 'vcAccountFriendsLists' },
            { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true }
        ],
        controller: ['listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'dialogService', '$localStorage', function (listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage) {
        	var $ctrl = this;

            $ctrl.getCustomer = function () {
                customerService.getCurrentCustomer().then(function (user) {
                    $ctrl.userName = user.data.userName;
                    $ctrl.initialize();
                })
            };

            $ctrl.selectTab = function (tabName) {
                $ctrl.selectedList = [];
                $ctrl.selectedTab = tabName;
                $ctrl.getCustomer();
            };

            $ctrl.initialize = function (lists) {     
				if ($ctrl.selectedTab === 'myLists') {
					loader.wrapLoading(function () {
						return listService.getOrCreateMyLists($ctrl.userName).then(function (result) {
							$ctrl.lists = result;
							selectDefault($ctrl.lists);
						});
					})
				}

				else if ($ctrl.selectedTab === 'friendsLists') {
					loader.wrapLoading(function () {
						return listService.getSharedLists($ctrl.userName).then(function (result) {
							$ctrl.lists = result;
							selectDefault($ctrl.lists);
						});
					})
				}
            };

			function selectDefault(lists) {
				if (_.find(lists, { default: true })) {
					var selected = _.find(lists, { default: true });
					$ctrl.selectList(selected);
				}
				else if (!_.isEmpty(lists)) {
					_.first(lists).default = true;
					$ctrl.selectList(_.first(lists));
				}
			}

            $ctrl.selectList = function (list) {
                $ctrl.selectedList = list;
            };

            $ctrl.addToCart = function (lineItem) {
                loader.wrapLoading(function () {
                    return cartService.addLineItem(lineItem.productId, 1).then(function (response) {
                        $ctrl.productAdded = true;
                        $timeout(function () {
                            $ctrl.productAdded = false;
                        }, 2000);
                    });
                });
            };

            $ctrl.removeList = function (listName) {
				loader.wrapLoading(function () {
					return listService.clearList(listName, $ctrl.userName).then(function (response) {
						document.location.reload();
					});
                });
            };

            $ctrl.removeLineItem = function (lineItem) {
				loader.wrapLoading(function () {
					return listService.removeLineItem(lineItem.id, $ctrl.selectedList.id, $ctrl.userName).then(function (result) {
					});
				});
            };

            $ctrl.generateLink = function () {
                $ctrl.sharedLink = $location.absUrl().substr(0, _.lastIndexOf($location.absUrl(), '/')) + '/friendsLists?id=' + $ctrl.selectedList.id;
                $ctrl.selectedList.permission = 'public';
                var dialogData = {sharedLink:$ctrl.sharedLink};
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-shared-link-dialog.tpl');
            };

            $ctrl.addToCartAllProducts = function () {
                _.each($ctrl.selectedList.items, function (item) {
                    loader.wrapLoading(function () {
                        return cartService.addLineItem(item.productId, 1).then(function (response) {
                            $ctrl.productAdded = true;
                            $timeout(function () {
                                $ctrl.productAdded = false;
                            }, 6000);
                        });
                    });
                })
            }

            $ctrl.createList = function () {
                var dialogData = $ctrl.lists;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl');
            };

            $ctrl.listSettings = function () {
                var dialogData = {};
                dialogData.lists = $ctrl.lists;
                dialogData.userName = $ctrl.userName;
                dialogData.selectedTab = $ctrl.selectedTab;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl');
            };

        }]
    })
    .component('vcAccountMyLists', {
        templateUrl: 'themes/assets/js/lists/account-lists.tpl.liquid',
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'listService', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, listService, customerService, loader, $timeout, dialogService, $localStorage) {
			var $ctrl = this;
			$ctrl.listPreSetting = function (lists) {
				customerService.getCurrentCustomer().then(function (user) {
					var userName = user.data.userName;
					loader.wrapLoading(function () {
						return listService.getOrCreateMyLists(userName, lists).then(function (result) {
						})
					})
				})
			};

            $ctrl.$onInit = function (lists) {
                $ctrl.accountLists.selectTab('myLists');
            }
        }]
    })
    .component('vcAccountFriendsLists', {
        templateUrl: "themes/assets/js/lists/account-lists.tpl.liquid",
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'listService', '$location', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, listService, $location, customerService, loader, $timeout, dialogService, $localStorage) {
            var $ctrl = this;

            function checkLocation() {
                var sharedCartId = $location.search().id.toString();
                customerService.getCurrentCustomer().then(function (user) {
                    var userName = user.data.userName;
				    var myLists = listService.getOrCreateMyLists(userName);
					loader.wrapLoading(function () {
                        return listService.addSharedList(userName, myLists, sharedCartId).then(function (result) {
                            $ctrl.accountLists.selectTab('friendsLists');
						});
					})
                })
            }

            $ctrl.$onInit = function () {
                if ($location.search().id)
                    checkLocation();               
                $ctrl.accountLists.selectTab('friendsLists');
            }
        }]
    });

angular.module('storefrontApp')
	.component('addToListButton', {
		templateUrl: 'themes/assets/js/lists/add-to-list-button.tpl.html',
		bindings: {
			selectedVariation: '<'
		},
		controller: ['customerService', 'listService', 'dialogService', function (customerService, listService, dialogService) {
			var $ctrl = this;
			$ctrl.$onInit = function () {
				compareProductInLists();
			}

			function compareProductInLists() {
				$ctrl.buttonInvalid = true;
			    customerService.getCurrentCustomer().then(function(user) {
			        listService.getOrCreateMyLists(user.data.userName, $ctrl.lists).then(function(result) {
			            $ctrl.lists = result;
			            angular.forEach($ctrl.lists, function(list) {
			                listService.containsInList($ctrl.selectedVariation.id, list.id).then(function(result) {
			                    if (result.contains === false) {
			                        $ctrl.buttonInvalid = false;
			                    }
			                });
			            });
			        });
			    });
			}

			function toListsDialogDataModel(product, quantity) {
				return {
					product: product,
					quantity: quantity,
					updated: false
				}
			}

			$ctrl.addProductToWishlist = function () {
				var dialogData = toListsDialogDataModel($ctrl.selectedVariation, 1);
				dialogService.showDialog(dialogData, 'recentlyAddedListItemDialogController', 'storefront.recently-added-list-item-dialog.tpl');
            }

            $ctrl.signInToProceed = function() {
                dialogService.showDialog({ title: 'Add product to list...' }, 'universalDialogController', 'storefront.sign-in-to-proceed.tpl');
            }

		}]
	})

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listService', '$translate', '$localStorage', 'customerService', function ($scope, $window, $uibModalInstance, dialogData, listService, $translate, $localStorage, customerService) {
    $scope.availableLists = [];
    $scope.selectedList = {};
    dialogData.product.imageUrl = dialogData.product.primaryImage.url;
    dialogData.product.createdDate = new Date;
    dialogData.product.productId = dialogData.product.price.productId;
    _.extend(dialogData.product, dialogData.product.price);
    _.extend(dialogData.product, dialogData.product.salePrice);

    $scope.dialogData = dialogData.product;
    $scope.dialogData.quantity = dialogData.quantity;
    $scope.inProgress = false;
    $scope.itemAdded = false;

    $scope.addProductToList = function () {
        $scope.inProgress = true;
        var customer = { userName: $scope.userName, id: $scope.userId, isRegisteredUser: true };

        if ($scope.userName !== $scope.selectedList.author) {
            dialogData.product.modifiedBy = $scope.userName;
		}
        listService.addItemToList($scope.selectedList.id, dialogData.product);

        $scope.inProgress = false;
        $scope.itemAdded = true;
    }
    $scope.selectList = function (list) {
        $scope.selectedList = list;
    };

    $scope.close = function () {
        $uibModalInstance.close();
    };
    $scope.redirect = function (url) {
        $window.location = url;
    }

    $scope.initialize = function (lists) {
        customerService.getCurrentCustomer().then(function (user) {
            $scope.userName = user.data.userName;
			listService.getOrCreateMyLists($scope.userName, lists).then(function (result) {
                $scope.lists = result;
                angular.forEach($scope.lists, function (list) {
                    list.title = list.name;
                    list.description = list.name;
                    listService.containsInList(dialogData.product.id, list.id).then(function (result) {
                        list.contains = result.contains;
                    })
                });
			})
			
			listService.getSharedLists($scope.userName).then(function (result) {
                $scope.sharedLists = result;
                angular.forEach($scope.sharedLists, function (list) {
                    list.title = list.name;
                    list.description = list.name;
                    listService.containsInList(dialogData.product.id, list.id).then(function (result) {
                        list.contains = result.contains;
                    })
                });
			})
        })
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listService', '$localStorage', 'loadingIndicatorService', '$translate', function($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listService, $localStorage, loader, $translate) {

    if (dialogData.sharedLink)
        $scope.sharedLink = dialogData.sharedLink;
    else {
        $scope.dialogData = dialogData.lists;
        $scope.userName = dialogData.userName;
        $scope.inProgress = false;
        $scope.data = $scope.listName;
        $scope.selectedTab = dialogData.selectedTab;
    }

    $scope.createList = function () {   
        if ($scope.dialogData.permission != 'public')
            $scope.dialogData.permission = 'private';

        $scope.dialogData.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
        customerService.getCurrentCustomer().then(function (user) {
            $scope.userName = user.data.userName;
            listService.getWishlist($scope.dialogData.listName, $scope.dialogData.permission, $scope.dialogData.id, user.data.userName);
            $uibModalInstance.close();
        })

    };

    $scope.setDefault = function (list) {
        _.each($scope.dialogData, function (x) {
            x.default = list === x;
        })
    };

    $scope.removeList = function (list) {
        if ($scope.selectedTab === 'friendsLists') {
			loader.wrapLoading(function () {
				return listService.removeFromFriendsLists(list.id, $scope.userName).then(function () {
				});
			})
        }
        else
            listService.clearList(list.id, $scope.userName);

        $uibModalInstance.close();
        document.location.reload();
    };

    $scope.selectedList = function (listName) {
        var items = listService.getWishlist(listName, '', '', $scope.userName).items;
        $scope.selectedList.items = items;
    };

    $scope.submitSettings = function () {
        angular.forEach(dialogData.lists, function (list) {
            if (list.delete)
                $scope.removeList(list);
        })
        $uibModalInstance.close();
    };

    $scope.close = function() {
        $uibModalInstance.close();
    };

    $scope.redirect = function (url) {
        $window.location = url;
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('priceController', ['$scope', '$window', 'pricingService', 'loadingIndicatorService', function ($scope, $window, pricingService, loader) {
    $scope.loader = loader;
    loader.wrapLoading(function() {
        return pricingService.getActualProductPrices($window.products).then(function(response) {
            var prices = response.data;
            $scope.prices = _.object(_.map(prices, function(price) {
                return [price.productId, price];
            }));
            $scope.prices.length = response.data.length;
        });
    });
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('purchaseController', ['$scope', '$localStorage', 'storefrontApp.mainContext', 'fulfillmentCenterService', function ($scope, $localStorage, mainContext, fulfillmentCenterService) {

    $scope.loadPaymentPlan = function(availablePaymentPlans, objectType, objectId) {
        $scope.availablePaymentPlans = availablePaymentPlans;
        $scope.paymentPlan = (($localStorage['paymentPlans'] || { })[objectType] || { })[objectId];
        $scope.paymentPlanType = $scope.paymentPlan ? 'auto-reorder' : 'one-time';
        $scope.paymentPlan = ($scope.paymentPlan ? _.findWhere(availablePaymentPlans, { intervalCount: $scope.paymentPlan.intervalCount, interval: $scope.paymentPlan.interval }) : undefined) ||
            _.findWhere($scope.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
    };

    $scope.updatePaymentPlan = function(objectType, objectId, paymentPlanType, paymentPlan) {
        if (!$localStorage['paymentPlans']) {
            $localStorage['paymentPlans'] = { };
        }
        if (!$localStorage['paymentPlans'][objectType]) {
            $localStorage['paymentPlans'][objectType] = { };
        }
        $scope.paymentPlanType = paymentPlanType;
        if (paymentPlanType === 'auto-reorder') {
            $localStorage['paymentPlans'][objectType][objectId] = paymentPlan;
            $scope.paymentPlan = paymentPlan;
        } else {
            $localStorage['paymentPlans'][objectType][objectId] = undefined;
            $scope.paymentPlan = undefined;
        }
    };

    $scope.shipmentType = $localStorage['shipmentType'] || 'shipping';
    $scope.shipmentAddress = $localStorage['shipmentAddress'];
    $scope.shipmentFulfillmentCenter = $localStorage['shipmentFulfillmentCenter'];
    $scope.shipmentFulfillmentCenterAddress = fulfillmentCenterService.toAddress($scope.shipmentFulfillmentCenter);

    $scope.$watch(
        function () { return mainContext.customer; },
        function (customer) {
            if (customer) {
                if (!$scope.shipmentAddress && customer.defaultShippingAddress) {
                    $scope.shipmentAddress = { postalCode: customer.defaultShippingAddress.postalCode };
                }
            }
        }
    );

    $scope.updateShipmentType = function(shipmentType, shipmentTypeInfo) {
        $localStorage['shipmentType'] = shipmentType;
        $scope.shipmentType = shipmentType;
        if (shipmentType === 'shipping') {
            $localStorage['shipmentAddress'] = shipmentTypeInfo;
            $scope.shipmentAddress = shipmentTypeInfo;
        } else {
            $localStorage['shipmentFulfillmentCenter'] = shipmentTypeInfo;
            $scope.shipmentFulfillmentCenter = shipmentTypeInfo;
            $scope.shipmentFulfillmentCenterAddress = fulfillmentCenterService.toAddress(shipmentTypeInfo);
        }
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('uibDropdownService', ['$delegate', function($delegate) {
        var service = $delegate;
        var close = service.close;
        service.close = function (dropdownScope, element, appendTo) {
            dropdownScope.focusToggleElement = function() {};
            close(dropdownScope, element, appendTo);
        }
        return $delegate;
    }]);

    $provide.decorator('uibDropdownDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        var compile = directive.compile;
        directive.compile = function () {
            var link = compile.apply(this, arguments);
            return function (scope, element, attrs, dropdownCtrl) {
                if (attrs.autoClose === 'mouseleave') {
                    dropdownCtrl.toggle(false);
                }

                var closeDropdown = function () {
                    scope.$apply(function () {
                        if (attrs.autoClose === 'mouseleave') {
                            dropdownCtrl.toggle(false);
                        }
                    });
                };

                element.on('mouseleave', closeDropdown);

                link.apply(this, arguments);

                scope.$on('$destroy', function () {
                    element.off('mouseleave', closeDropdown);
                });
            };
        };
        return $delegate;
    }]);

    $provide.decorator('uibDropdownToggleDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        directive.controller = function () { };
        $delegate[0] = directive;
        return $delegate;
    }]);
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcDropdownClose', function () {
    return {
        require: ['?^uibDropdown'],
        link: function (scope, element, attrs, ctrls) {
            var dropdownCtrl = ctrls[0];
            if (!dropdownCtrl) {
                return;
            }

            var closeDropdown = function () {
                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        dropdownCtrl.toggle(false);
                    });
                }
            };

            element.on('click', closeDropdown);

            scope.$on('$destroy', function () {
                element.off('click', closeDropdown);
            });
        }
    };
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcDropdownTrigger', function () {
    return {
        require: ['?^uibDropdown', '?uibDropdownToggle'],
        link: function (scope, element, attrs, ctrls) {
            if (attrs.vcDropdownTrigger === 'mouseenter') {
                var dropdownCtrl = ctrls[0];
                var dropdownToggleCtrl = ctrls[1];
                if (!(dropdownCtrl && dropdownToggleCtrl)) {
                    return;
                }

                element.addClass('dropdown-trigger-mouseenter');

                var openDropdown = function() {
                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function() {
                            dropdownCtrl.toggle(true);
                        });
                    }
                };

                element.on('mouseenter', openDropdown);

                scope.$on('$destroy', function() {
                    element.off('mouseenter', openDropdown);
                });
            }
        }
    };
});

var storefrontApp = angular.module('storefrontApp');

// based on https://github.com/angular/angular.js/blob/master/src/ng/directive/ngInclude.js
storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('ngIncludeDirective', ['$delegate', function ($delegate) {
        var includeFillContentDirective = $delegate[1];
        var link = includeFillContentDirective.link;
        includeFillContentDirective.link = function (scope, $element, $attr, ctrl) {
            if (!Object.keys($attr).includes('raw')) {
                link(scope, $element, $attr, ctrl);
            } else {
                $element.text(ctrl.template);
            }
        };
        includeFillContentDirective.compile = function () {
            return includeFillContentDirective.link;
        };
        $delegate[1] = includeFillContentDirective;
        return $delegate;
    }]);
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcQuerySource', ['$parse', '$location', '$httpParamSerializer', 'searchQueryService', function ($parse, $location, $httpParamSerializer, searchQueryService) {
    return {
        restrict: "A",
        compile: function (tElem, tAttr) {
            if (!tAttr.href) {
                return function (scope, element, attrs) {
                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') return;

                    // get query from current url, replace query parts with specified parts and set href
                    var setUrl = function (querySource, switchable) {
                        switchable = switchable == 'true';
                        var state = searchQueryService.deserialize(searchQueryService.get(), {});
                        var result = searchQueryService.merge(state, querySource, switchable);
                        var params = searchQueryService.serialize(result, {});
                        var url = new URL($location.absUrl());
                        url.search = $httpParamSerializer(params);
                        element.attr("href", url.href);
                    };
                    scope.$watch(function () {
                        return $parse(attrs.vcQuerySource)(scope);
                    }, function (value) {
                        setUrl(value, attrs.switchable);
                    }, true);
                    scope.$watch(function () {
                        return attrs.switchable;
                    }, function (value) {
                        setUrl($parse(attrs.vcQuerySource)(scope), value);
                    });
                }
            }
        }
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcQueryTarget', ['$parse', '$location', 'searchQueryService', function ($parse, $location, searchQueryService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var vcQueryTarget = $parse(attrs.vcQueryTarget);
            // get requested keys and set ng-model value to value of ?key1=value1&key2=value2
            var state = searchQueryService.deserialize(searchQueryService.get(), vcQueryTarget(scope));
            vcQueryTarget.assign(scope, state);
        }
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcScope', ['$animate', '$compile', function ($animate) {
    return {
        multiElement: true,
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        link: function ($scope, $element, $attr, ctrl, $transclude) {
            $transclude(function (clone) {
                $element.after(clone);
            });
        }
    }
}]);

angular.module('storefrontApp')
    .component('addToCompareCheckbox', {
        templateUrl: 'themes/assets/js/product-compare/add-to-compare-checkbox.tpl.html',
        bindings: {
            productId: '<',
            buttonType: '<',
            customClass: '<',
            buttonWidth: '<'
        },
        controller: ['$rootScope', '$scope', 'catalogService', 'dialogService', 'compareProductService', function($rootScope, $scope, catalogService, dialogService, compareProductService) {
            var $ctrl = this;
            $ctrl.containProduct = false;

            $ctrl.$onInit = function () {
                $ctrl.containProduct = compareProductService.isInProductCompareList($ctrl.productId);
            }

            $ctrl.addProductToCompareList = function (event) {
                event.preventDefault();
                catalogService.getProduct($ctrl.productId).then(function(response) {
                    var product = response.data[0];
                    event.preventDefault();
                    var isInProductList = compareProductService.isInProductCompareList($ctrl.productId);
                    if (!isInProductList) {
                        var count = compareProductService.getProductsCount();
                        if (count < 5) {
                        $ctrl.containProduct = true;
                        compareProductService.addProduct($ctrl.productId);
                        $rootScope.$broadcast('productCompareListChanged');
                        }
                    }
                    else {
                        $ctrl.containProduct = false;
                        compareProductService.removeProduct($ctrl.productId);
                        $rootScope.$broadcast('productCompareListChanged');
                    }
                })
            };
        }]
    })


angular.module('storefrontApp')
    .component('productCompareListBar', {
        templateUrl: "themes/assets/js/product-compare/product-compare-list-bar.tpl.html",
        controller: ['compareProductService', 'catalogService', '$scope', '$rootScope', '$location',
            function(compareProductService, catalogService, $scope, $rootScope, $location) {
                var $ctrl = this;
                $ctrl.showedBody = true;
                $ctrl.products = [];
                $ctrl.showBodyText = "Hide";
                $ctrl.showBodyIcon = "fa fa-angle-down";
                function canShowBar() {
                    var path = $location.absUrl();
                    if (path.indexOf("/compare") !== -1) {
                        return false;
                    }
                    return true;
                }

                $ctrl.showBar = canShowBar();

                function initialize() {
                    if (!$ctrl.showBar) return;
                    var productsIds = compareProductService.getProductsIds();
                    if (!_.isEmpty(productsIds)) {
                        catalogService.getProducts(productsIds).then(function(response) {
                            $ctrl.products = response.data;
                        });
                    };
                }

                $ctrl.$onInit = function() {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                }

                $scope.$on('productCompareListChanged', function(event, data) {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                });

                $ctrl.clearCompareList = function () {
                    compareProductService.clearCompareList();
                    $ctrl.products = [];
                    $rootScope.$broadcast('productCompareListChanged');
                }

                $ctrl.showBody = function () {
                    $ctrl.showedBody = !$ctrl.showedBody;
                    if ($ctrl.showedBody) {
                        $ctrl.showBodyText = "Hide";
                        $ctrl.showBodyIcon = "fa fa-angle-down";
                    }
                    else {
                        $ctrl.showBodyText = "Show";
                        $ctrl.showBodyIcon = "fa fa-angle-up";
                    }
                }
            
                $ctrl.removeProduct = function (product) {
                    compareProductService.removeProduct(product.id)
                    $ctrl.products = _.without($ctrl.products, product);
                    $rootScope.$broadcast('productCompareListChanged');
                }
            }]
    });

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productCompareListController', ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService', 'compareProductService',
function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService, compareProductService) {
    var $ctrl = this;
    $ctrl.containProduct = false;
    $scope.properties = [];
    $scope.products = [];

    function initialize() {
        $scope.loaded = false;
        $ctrl.loading = true;
        var productsIds = compareProductService.getProductsIds();
        if (_.isEmpty(productsIds)) {
            $scope.loaded = true;
            $ctrl.loading = false;
            return;
        }
        catalogService.getProducts(productsIds).then(function(response) {
            if (_.indexOf(productsIds, '&') != -1) {
                $scope.products = response.data;
                _.each($scope.products, function(product) {
                    modifyProperty(product);
                })
            }
            else {
                var product = response.data[0];
                modifyProperty(product);
                $scope.products.push(product);
            }
            $scope.getProductProperties();
            $scope.loaded = true;
            $ctrl.loading = false;
        })
    };

    $scope.addProductToCompareList = function (productId, event) {
        event.preventDefault();
        var isInProductList = compareProductService.isInProductCompareList(productId);
        if (!isInProductList) {
            $ctrl.containProduct = true;
            compareProductService.addProduct(productId);
            $rootScope.$broadcast('productCompareListChanged');
        }
    }

    $scope.getProductProperties = function () {
        if (_.isEmpty($scope.products))
            return [];
        var grouped = {};
        var properties = _.flatten(_.map($scope.products, function(product) { return product.properties; }));
        var propertyDisplayNames = _.uniq(_.map(properties, function(property) { return property.displayName; }));
        _.each(propertyDisplayNames, function(displayName) {
            grouped[displayName] = [];
            var props = _.where(properties, { displayName: displayName });
            _.each($scope.products, function(product) {
                var productProperty = _.find(props, function(prop) { return prop.productId === product.id });
                if (productProperty) {
                    grouped[displayName].push(productProperty);
                } else {
                    grouped[displayName].push({ valueType: 'ShortText', value: '-' });
                }
            });
        });
        $scope.properties = grouped;
    }

    function modifyProperty(product) {
        _.each(product.properties, function(property) {
            property.productId = product.id;
            if (property.valueType.toLowerCase() === 'number') {
                property.value = formatNumber(property.value);
            }
        })
        return product;
    }

    $scope.hasValues = function (properties, onlyDifferences) {
        var uniqueValues = _.uniq(_.map(properties, function (p) { return p.value }));
        if (onlyDifferences && properties.length > 1 && uniqueValues.length == 1) {
            return false;
        }
        return true;
    }

    $scope.clearCompareList = function () {
        compareProductService.clearCompareList();
        $scope.products = [];
        $rootScope.$broadcast('productCompareListChanged');
        $scope.properties = [];
    }

    $scope.removeProduct = function (product) {
        compareProductService.removeProduct(product.id)
        $scope.products = _.without($scope.products, product);
        $rootScope.$broadcast('productCompareListChanged');
        $scope.getProductProperties();
    }

    function formatNumber(number) {
        var float = parseFloat(number);
        return !isNaN(float) ? float : number;
    }
    initialize();
}]);

storefrontApp.controller('productCompareListDialogController', ['$scope', '$window', 'dialogData', '$uibModalInstance',
function ($scope, $window, dialogData, $uibModalInstance) {
    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }    
}]);
storefrontApp.service('availabilityService', ['$http', '$q', 'apiBaseUrl', function ($http, $q, apiBaseUrl) {
    return {
        getProductsAvailability: function (ids) {
            // return $http.post(apiBaseUrl + 'api/availabilty/product', ids);
            // mock
            var deferredData = $q.defer();
            deferredData.resolve({
                data: ids.map(function(id) {
                    return { productId: id, expectedArrival: Date.now(), availableSince: Date.now() };
                })
            });
            return deferredData.promise;
        }
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('fulfillmentCenterService', ['$http', 'apiBaseUrl', function ($http, apiBaseUrl) {
    return {
        searchFulfillmentCenters: function (criteria) {
            return $http.post(apiBaseUrl + 'api/fulfillment/search/centers', criteria);
        },
        toAddress: function (fulfillmentCenter) {
            if (fulfillmentCenter) {
                return {
                    countryName: fulfillmentCenter.countryName,
                    countryCode: fulfillmentCenter.countryCode,
                    regionName: fulfillmentCenter.stateProvince,
                    city: fulfillmentCenter.city,
                    line1: fulfillmentCenter.line1,
                    line2: fulfillmentCenter.line2,
                    postalCode: fulfillmentCenter.postalCode,
                    phone: fulfillmentCenter.daytimePhoneNumber
                };
            }
        }
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('loadingIndicatorService', function() {
    var retVal = {
        isLoading: false,
        wrapLoading: function(func) {
            retVal.isLoading = true;
            return func().then(
                function(result) {
                    retVal.isLoading = false;
                    return result;
                },
                function() { retVal.isLoading = false; });
        }
    }
    return retVal;
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('searchQueryService', ['$location', function ($location) {
    return {
        // emulate html5 mode because of bug in Microsoft Edge
        get: function () {
            var result = {};
            var url = new URL($location.absUrl());
            var entries = url.searchParams.entries();
            var pair = entries.next();
            while (!pair.done) {
                result[pair.value[0]] = pair.value[1];
                pair = entries.next();
            }
            return result;
        },

        // Deserializes search query strings like 'key=value1[,value2]' or 'key=key1:value1[,value2[;key2:value3[,value4]]]'
        deserialize: function (searchQuery, defaults) {
            var deserializeValues = function(string) {
                return string.split(',');
            };
            var deserializePairs = function (string) {
                return _.object(string.split(';').map(function(pairString) {
                    return _.reduce(pairString.split(':'), function (key, value) {
                        return [key, deserializeValues(value)];
                    });
                }));
            };
            searchQuery = searchQuery || {};
            defaults = defaults || {};
            var result = {};
            _.each(Object.keys(searchQuery), (function (key) {
                var string = searchQuery[key];
                if (string) {
                    var deserialize = string.includes(':') ? deserializePairs : deserializeValues;
                    result[key] = deserialize(string);
                }
            }));
            result = _.defaults(result, defaults);
            return result;
        },

        merge: function (searchQuery, changes, switchable) {
            if (!switchable) {
                return _.extend(searchQuery, changes);
            } else {
                var mergeValues = function (searchQueryValues, changeValues) {
                    var checkedValues = _.difference((searchQueryValues || []).concat(changeValues || []), _.intersection(searchQueryValues, changeValues));
                    return changeValues !== null && checkedValues.length ? checkedValues : null;
                };
                var mergePairs = function (searchQueryPairs, changePairs) {
                    return _.object(_.compact(_.union(Object.keys(searchQueryPairs), Object.keys(changePairs)).map(function (key) {
                        var mergedValues = mergeValues(searchQueryPairs[key], changePairs[key]);
                        return mergedValues !== null ? [key, mergedValues] : null;
                    })));
                };
                return _.object(_.compact(_.union(Object.keys(searchQuery), Object.keys(changes)).map(function (key) {
                    var searchQueryValues = searchQuery[key];
                    var changeValues = changes[key];
                    if (changeValues !== null) {
                        if (searchQueryValues && changeValues && angular.isArray(searchQueryValues) !== angular.isArray(changeValues)) {
                            throw 'Type of ' + key + ' in search query is' + typeof (searchQueryValues[key]) + ' while in changes is' + typeof (changeValues[key]);
                        }
                        if (!angular.isArray(changeValues)) {
                            var mergedPairs = mergePairs(searchQueryValues || [], changeValues || []);
                            return !_.isEmpty(mergedPairs) ? [key, mergedPairs] : null;
                        } else {
                            var mergedValues = mergeValues(searchQueryValues, changeValues);
                            return mergedValues !== null ? [key, mergedValues] : null;
                        }
                    } else {
                        return null;
                    }
                })));
            }
        },

        // Serializes search query objects like { view: ['list'], terms: { Color: ["Black, "Red"], Brand: ["VirtoCommerce", "Microsoft"] } }  to string 
        serialize: function (searchQuery, defaults) {
            var serializeValues = function (values) {
                return values.join(',');
            };
            var serializePairs = function (pairs) {
                return _.map(Object.keys(pairs), function(key) {
                    return [key, serializeValues(pairs[key])].join(':');
                }).join(';');
            };
            searchQuery = searchQuery || {};
            defaults = defaults || {};
            var result = _.defaults(searchQuery, defaults);
            return _.mapObject(result, function(values, key) {
                return values !== null ? !angular.isArray(values) ? serializePairs(values) : serializeValues(values) : null;
            });
        }
    }
}]);

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

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/components/purchase/paymentPlan.tpl.html",
    bindings: {
        availablePaymentPlans: '<',
        paymentPlanType: '<',
        paymentPlan: '<',
        onChange: '&'
    },
    controller: [function() {
        var $ctrl = this;

        $ctrl.change = function() {
            $ctrl.onChange({ paymentPlanType: $ctrl.paymentPlanType, paymentPlan: $ctrl.paymentPlan });
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcShipmentType', {
    templateUrl: "themes/assets/js/components/purchase/shipmentType.tpl.html",
    bindings: {
        ctrl: '=',
        shipmentType: '<',
        shipmentAddress: '<',
        shipmentFulfillmentCenter: '<',
        onFulfillmentCenterSelection: '&',
        onChange: '&'
    },
    transclude: true,
    controllerAs: '$ctrl',
    controller: ['$scope', '$localStorage', 'storefrontApp.mainContext', 'dialogService', function($scope, $localStorage, mainContext, dialogService) {
        var $ctrl = this;
        $ctrl.ctrl = $ctrl;

        $ctrl.selectFulfillmentCenter = function () {
            var modalInstance = dialogService.showDialog({ searchPhrase: $ctrl.shipmentFulfillmentCenter ? $ctrl.shipmentFulfillmentCenter.postalCode : null }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            modalInstance.result.then(function(fulfillmentCenter) {
                $ctrl.shipmentFulfillmentCenter = fulfillmentCenter;
                if ($ctrl.onFulfillmentCenterSelection) {
                    $ctrl.onFulfillmentCenterSelection();
                }
            });
        };
        $ctrl.change = function () {
            if ($ctrl.shipmentType === 'shipping' && $ctrl.shipmentAddress || $ctrl.shipmentType === 'pickup' && $ctrl.shipmentFulfillmentCenter) {
                $ctrl.onChange({ shipmentType: $ctrl.shipmentType, shipmentTypeInfo: $ctrl.shipmentType === 'shipping' ? $ctrl.shipmentAddress : $ctrl.shipmentFulfillmentCenter });
            }
        }
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.constant('vcTotalsDefaults', {
    show: {
        subtotal: true,
        taxes: true,
        shipping: true,
        payment: true,
        discount: true
    },
    complete: false
});

storefrontApp.component('vcTotals', {
    templateUrl: "themes/assets/js/components/purchase/totals.tpl.liquid",
	bindings: {
        order: '<',
        options: '<'
    },
    controller: ['vcTotalsDefaults', function(defaults) {
        var $ctrl = this;

        $ctrl.options = angular.merge({ }, defaults, $ctrl.options);

        var fieldSuffix = $ctrl.showWithTaxes ? 'WithTax' : '';
        $ctrl.fieldNames = {
            subTotal: 'subTotal' + fieldSuffix,
            shippingPrice: 'shippingPrice' + fieldSuffix,
            shippingTotal: 'shippingTotal' + fieldSuffix,
            payment: 'paymentPrice' + fieldSuffix,
            discount: 'discountTotal' + fieldSuffix
        };
    }]
});

angular.module('storefrontApp')
.controller('universalDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
    angular.extend($scope, dialogData);

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    }
}]);

angular.module('storefrontApp')
    .factory('authService', ['storefrontApp.mainContext', '$auth', '$httpParamSerializerJQLike', '$interpolate', '$rootScope', 'storefront.corporateAccountApi',
        function (mainContext, $auth, $httpParamSerializerJQLike, $interpolate, $rootScope, corporateAccountApi) {

            var authContext = {
                userId: null,
                userLogin: null,
                fullName: null,
                userType: null,
                roles: null,
                permissions: null,
                isAuthenticated: false
            };

            authContext.login = function (login, password) {
                return $auth.login($httpParamSerializerJQLike({
                    userName: login,
                    password: password,
                    grant_type: "password"
                }),
                    {
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
            };

            authContext.fillAuthData = function () {
                return corporateAccountApi.getUser({ userName: mainContext.customer.userName },
                    function (result) {
                        changeAuth(result)
                        $rootScope.$broadcast('loginStatusChanged', authContext);
                    },
                    function (error) { });
            };

            authContext.checkPermission = function (permission, securityScopes) {
                //first check admin permission
                // var hasPermission = $.inArray('admin', authContext.permissions) > -1;
                var hasPermission = authContext.isAdministrator;
                if (!hasPermission && permission) {
                    permission = permission.trim();
                    //first check global permissions
                    hasPermission = $.inArray(permission, authContext.permissions) > -1;
                    if (!hasPermission && securityScopes) {
                        if (typeof securityScopes === 'string' || angular.isArray(securityScopes)) {
                            securityScopes = angular.isArray(securityScopes) ? securityScopes : securityScopes.split(',');
                            //Check permissions in scope
                            hasPermission = _.some(securityScopes, function (x) {
                                var permissionWithScope = permission + ":" + x;
                                var retVal = $.inArray(permissionWithScope, authContext.permissions) > -1;
                                //console.log(permissionWithScope + "=" + retVal);
                                return retVal;
                            });
                        }
                    }
                }
                return hasPermission;
            };

            function changeAuth(results) {
                authContext.userId = results.id;
                authContext.roles = results.roles;
                authContext.permissions = results.permissions;
                authContext.userLogin = results.userName;
                authContext.fullName = results.userLogin;
                authContext.isAuthenticated = results.userName != null;
                authContext.userType = results.userType;
                authContext.isAdministrator = results.isAdministrator;
                //Interpolate permissions to replace some template to real value
                if (authContext.permissions) {
                    authContext.permissions = _.map(authContext.permissions, function (x) {
                        return $interpolate(x)(authContext);
                    });
                }
            };

            return authContext;
        }])
    .constant('tokenExpirationName', 'platform_access_token_expiration_time')
    .config(['$authProvider', '$provide', 'apiBaseUrl', function ($authProvider, $provide, apiBaseUrl) {
        $authProvider.loginUrl = apiBaseUrl + 'Token';
        $authProvider.tokenName = 'access_token';
        $authProvider.tokenPrefix = 'platform';
        $authProvider.oauth2({
            name: 'platform',
            clientId: 'web'
        });
        $provide.decorator('SatellizerShared', ['$delegate', 'tokenExpirationName', function ($delegate, tokenExpirationName) {
            var service = $delegate;
            var originalSetToken = service.setToken;
            service.setToken = function (response) {
                originalSetToken.apply(service, arguments);
                var expirationTime = Date.parse(response.data['.expires']);
                this.SatellizerStorage.set(tokenExpirationName, expirationTime);;
            };
            return service;
        }]);
    }])
    .run(['$auth', 'SatellizerConfig', 'SatellizerStorage', 'tokenExpirationName', '$timeout', '$window', '$location', function ($auth, $authProvider, $authStorage, tokenExpirationName, $timeout, $window, $location) {
        var logOut = function () {
            $auth.logout();
            $authStorage.remove(tokenExpirationName);
            $window.location.href = $location.protocol() + "://" + $location.host() + ":" + $location.port() + '/account/logout';
        };

        if ($auth.isAuthenticated()) {
            $timeout(logOut, parseFloat($authStorage.get(tokenExpirationName)) - Date.now());
        }
    }]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('cartController', ['$rootScope', '$scope', '$timeout', 'cartService', 'catalogService', 'availabilityService', 'loadingIndicatorService', function ($rootScope, $scope, $timeout, cartService, catalogService, availabilityService, loader) {
    var timer;

    $scope.loader = loader;
    $scope.coupon = {};

    var reloadCart = $scope.reloadCart = function() {
        loader.wrapLoading(function() {
            return cartService.getCart().then(function(response) {
                var cart = response.data;
                cart.hasValidationErrors = _.some(cart.validationErrors) || _.some(cart.items, function(item) { return _.some(item.validationErrors) });
                $scope.cart = cart;

                var coupon = cart.coupon || $scope.coupon;
                coupon.loader = $scope.coupon.loader;
                $scope.coupon = coupon;
                if ($scope.coupon.code && !$scope.coupon.appliedSuccessfully) {
                    $scope.coupon.errorCode = 'InvalidCouponCode';
                }

                return availabilityService.getProductsAvailability(_.pluck(cart.items, 'productId')).then(function(response) {
                    $scope.availability = _.object(_.pluck(response.data, 'productId'), response.data);
                });
            });
        });
    };

    initialize();

    $scope.setCartForm = function (form) {
        $scope.formCart = form;
    }

    $scope.changeLineItemQuantity = function (lineItemId, quantity) {
        var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || quantity < 1 || $scope.cartIsUpdating || $scope.loader.isLoading || $scope.formCart.$invalid) {
            return;
        }
        var initialQuantity = lineItem.quantity;
        lineItem.quantity = quantity;
        $timeout.cancel(timer);
        timer = $timeout(function () {
            $scope.cartIsUpdating = true;
            cartService.changeLineItemQuantity(lineItemId, quantity).then(function (response) {
                reloadCart();
                $rootScope.$broadcast('cartItemsChanged');
            }, function (response) {
                lineItem.quantity = initialQuantity;
                $scope.cartIsUpdating = false;
            });
        }, 300);
    }

    $scope.changeLineItemPrice = function (lineItemId, newPrice) {
    	var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || $scope.cartIsUpdating || $scope.loader.isLoading) {
    		return;
    	}
    	$scope.cartIsUpdating = true;
    	cartService.changeLineItemPrice(lineItemId, newPrice).then(function (response) {
    		reloadCart();
    		$rootScope.$broadcast('cartItemsChanged');
    	}, function (response) {
    		$scope.cart.items = initialItems;
    		$scope.cartIsUpdating = false;
    	});
    };
    $scope.removeLineItem = function (lineItemId) {
        var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || $scope.cartIsUpdating || $scope.loader.isLoading) {
            return;
        }
        $scope.cartIsUpdating = true;
        var initialItems = angular.copy($scope.cart.items);
        $scope.recentCartItemModalVisible = false;
        $scope.cart.items = _.without($scope.cart.items, lineItem);
        cartService.removeLineItem(lineItemId).then(function (response) {
            reloadCart();
            $rootScope.$broadcast('cartItemsChanged');
        }, function (response) {
            $scope.cart.items = initialItems;
            $scope.cartIsUpdating = false;
        });
    }

    $scope.clearCart = function() {
        loader.wrapLoading(function() {
            return cartService.clearCart().then(function() {
                reloadCart();
                $rootScope.$broadcast('cartItemsChanged');
            });
        });
    };

    $scope.submitCart = function () {
        $scope.formCart.$setSubmitted();
        if ($scope.formCart.$invalid) {
            return;
        }
        if ($scope.cart.hasPhysicalProducts) {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout');
        } else {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout');
        }
    }

    $scope.searchProduct = function () {
        $scope.productSearchResult = null;
        if ($scope.productSkuOrName) {
            $timeout.cancel(timer);
            timer = $timeout(function () {
                $scope.productSearchProcessing = true;
                var criteria = {
                    keyword: $scope.productSkuOrName,
                    start: 0,
                    pageSize: 5
                }
                catalogService.search(criteria).then(function (response) {
                    $scope.productSearchProcessing = false;
                    $scope.productSearchResult = response.data.products;
                }, function (response) {
                    $scope.productSearchProcessing = false;
                });
            }, 300);
        }
    }

    $scope.selectSearchedProduct = function (product) {
        $scope.productSearchResult = null;
        $scope.selectedSearchedProduct = product;
        $scope.productSkuOrName = product.name;
    }

    $scope.addProductToCart = function (product, quantity) {
        $scope.cartIsUpdating = true;
        cartService.addLineItem(product.id, quantity).then(function (response) {
            reloadCart();
            $scope.productSkuOrName = null;
            $scope.selectedSearchedProduct = null;
            $rootScope.$broadcast('cartItemsChanged');
        });
    }
    
    $scope.applyCoupon = function (coupon) {
        coupon.loader.wrapLoading(function() {
            return cartService.addCoupon(coupon.code).then(function() {
                reloadCart();
            });
        });
    }

    $scope.removeCoupon = function (coupon) {
        coupon.loader.wrapLoading(function() {
            return cartService.removeCoupon().then(function() {
                $scope.coupon = { loader: $scope.coupon.loader };
                reloadCart();
            });
        });
    }

    function initialize() {
        reloadCart();
    }
}]);

storefrontApp.controller('cartBarController', ['$scope', 'cartService', function ($scope, cartService) {
    getCartItemsCount();

    $scope.$on('cartItemsChanged', function (event, data) {
        getCartItemsCount();
    });

    function getCartItemsCount() {
        cartService.getCartItemsCount().then(function (response) {
            $scope.cartItemsCount = response.data;
        });
    }
}]);

storefrontApp.controller('recentlyAddedCartItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', function ($scope, $window, $uibModalInstance, dialogData) {
    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('collectionController', ['$scope', '$location', function ($scope, $location) {
    var $ctrl = this;
    $ctrl.sortModes = {
        'manual': 'collections.sorting.featured',
        'best-selling': 'collections.sorting.best_selling',
        'title-ascending': 'collections.sorting.az',
        'title-descending': 'collections.sorting.za',
        'price-ascending': 'collections.sorting.price_ascending',
        'price-descending': 'collections.sorting.price_descending',
        'createddate-descending': 'collections.sorting.date_descending',
        'createddate-ascending': 'collections.sorting.date_ascending'
    };
    $ctrl.viewQuery = { view: ['grid'] };
    $ctrl.generatePageSizes = function (capacity, steps) {
        $ctrl.pageSizeQuery = { page_size: [capacity] };
        // for example            start: 16 stop: 16 * 3 + 1 = 49 step: 16
        $ctrl.pageSizes = _.range(capacity, capacity * steps + 1, capacity);
    }
    $ctrl.keywordQuery = { keyword: [] };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcContentPlace', ['$compile', 'marketingService', function ($compile, marketingService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            marketingService.getDynamicContent(attrs.id).then(function (response) {
                element.html($compile(response.data)(scope));
            });
        },
        replace: true
    }
}]);

storefrontApp.directive('vcEnterSource', ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        controller: function() { },
        link: function (scope, element, attrs, ctrl) {
            var onKeyPress = function (event) {
                if (event.keyCode === 13) { // Enter
                    ctrl.element[0].click();
                }
            };
            element.on('keypress', onKeyPress);
            scope.$on('$destroy', function () {
                element.off('keypress', onKeyPress);
            });
        }
    };
}]);

storefrontApp.directive('vcEnterTarget', [function () {
    return {
        restrict: "A",
        require: "^vcEnterSource",
        link: function (scope, element, attrs, ctrl) {
            ctrl.element = element;
        }
    };
}]);

storefrontApp.directive('fallbackSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('error', errorHandler);

            scope.$on('$destroy', function() {
                element.off('error', errorHandler);
            });

            function errorHandler(event) {
                if (element.attr('src') !== attrs.fallbackSrc) {
                    element.attr('src', attrs.fallbackSrc);
                }
                else {
                    element.off(event);
                }
            };
        }
    }
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.filter('imgurl', function () {
    return function (input, type) {
        if (!type)
            return input;

        var extention = '.' + input.split('.').pop();
        var suffix = "_" + type;
        var result = input.replace(extention, suffix+extention);
        return result;
    };
});
var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['$scope', 'dialogService', 'fulfillmentCenterService', function ($scope, dialogService, fulfillmentCenterService) {
    $scope.searchFulfillmentCenters = function() {
        fulfillmentCenterService.searchFulfillmentCenters({ searchPhrase: $scope.searchPhrase }).then(function(response) {
            $scope.fulfillmentCenters = response.data.results;
        });
    };

    $scope.selectFulfillmentCenter = function() {
        dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
    };

    $scope.fulfillmentCenterToAddress = function (fulfillmentCenter) {
        return fulfillmentCenterService.toAddress(fulfillmentCenter);
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('mainController', ['$rootScope', '$scope', '$location', '$window', 'customerService', 'storefrontApp.mainContext',
    function ($rootScope, $scope, $location, $window, customerService, mainContext) {

        //Base store url populated in layout and can be used for construction url inside controller
        $scope.baseUrl = {};

        $rootScope.$on('$locationChangeSuccess', function () {
            var path = $location.path();
            if (path) {
                $scope.currentPath = path.replace('/', '');
            }
        });

        $rootScope.$on('storefrontError', function (event, data) {
            $rootScope.storefrontNotification = data;
            $rootScope.storefrontNotification.detailsVisible = false;
        });

        $rootScope.toggleNotificationDetails = function () {
            $rootScope.storefrontNotification.detailsVisible = !$rootScope.storefrontNotification.detailsVisible;
        }

        $rootScope.closeNotification = function () {
            $rootScope.storefrontNotification = null;
        }

        //For outside app redirect (To reload the page after changing the URL, use the lower-level API)
        $scope.outerRedirect = function (absUrl) {
            $window.location.href = absUrl;
        };

        //change in the current URL or change the current URL in the browser (for app route)
        $scope.innerRedirect = function (path) {
            $location.path(path);
            $scope.currentPath = $location.$$path.replace('/', '');
        };

        $scope.stringifyAddress = function (address) {
            var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.getObjectSize = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        }

        mainContext.getCustomer = $scope.getCustomer = function () {
            customerService.getCurrentCustomer().then(function (response) {
                var addressId = 1;
                _.each(response.data.addresses, function (address) {
                    address.id = addressId;
                    addressId++;
                });
                response.data.isContact = response.data.memberType === 'Contact';
                mainContext.customer = $scope.customer = response.data;
            });
        };

        $scope.getCustomer();
    }])

.factory('storefrontApp.mainContext', function () {
    return {};
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.controller('orderController', ['$scope', '$window', 'orderService', function ($scope, $window, orderService) {
    getOrder($window.orderNumber);

    function getOrder(orderNumber) {
        orderService.getOrder(orderNumber).then(function (response) {
            if (response && response.data) {
                $scope.order = response.data;
            }
        });
    }
}]);
angular.module('storefrontApp')
.directive('vaPermission', ['authService', function (authService) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                //modelObject is a scope property of the parent/current scope
                scope.$watch(attrs.securityScopes, function (value) {
                    if (value) {
                        toggleVisibilityBasedOnPermission(value);
                    }
                });

                function toggleVisibilityBasedOnPermission(securityScopes) {
                    var hasPermission = authService.checkPermission(permissionValue, securityScopes);
                    if (hasPermission)
                        angular.element(element).show();
                    else
                        angular.element(element).hide();
                }

                toggleVisibilityBasedOnPermission();
                scope.$on('loginStatusChanged', toggleVisibilityBasedOnPermission);
            }
        }
    };
}]);
if (Prism.languages.markup) {
    Prism.languages.insertBefore('markup', 'tag', {
        'script': {
            pattern: /(<script[\s\S]*?type="text\/ng-template"[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
            lookbehind: true,
            inside: Prism.languages.html,
            alias: 'language-html'
        }
    });
}

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productController', ['$rootScope', '$scope', '$window', '$timeout', 'dialogService', 'catalogService', 'cartService', 'quoteRequestService', 'availabilityService',
    function ($rootScope, $scope, $window, $timeout, dialogService, catalogService, cartService, quoteRequestService, availabilityService) {
        //TODO: prevent add to cart not selected variation
        // display validator please select property
        // display price range

        $scope.allVariations = [];
        $scope.allVariationsMap = {}
        $scope.allVariationPropsMap = {};
        $scope.filterableVariationPropsMap = { };
        $scope.selectedVariation = {};
        $scope.productPrice = null;
        $scope.productPriceLoaded = false;

        $scope.addProductToCart = function (product, quantity) {
            var dialogData = toDialogDataModel(product, quantity);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
            cartService.addLineItem(product.id, quantity).then(function (response) {
                $rootScope.$broadcast('cartItemsChanged');
            });
        }

        // TODO: Replace mock with real function
        $scope.addProductsToCartMock = function () {
            var rejection = {
                data: {
                    message: "The 1 product(s) below was not added to cart:",
                    modelState: {
                        "Test": "Test"
                    }
                }
            };
            var items = [
                {
                    id: "9cbd8f316e254a679ba34a900fccb076",
                    name: "3DR Solo Quadcopter (No Gimbal)",
                    imageUrl: "//localhost/admin/assets/catalog/1428965138000_1133723.jpg",
                    price: {
                        actualPrice: {
                            formattedAmount: "$896.39"
                        },
                        actualPriceWithTax: {
                            formattedAmount: "$1,075.67"
                        },
                        listPrice: {
                            formattedAmount: "$995.99"
                        },
                        listPriceWithTax: {
                            formattedAmount: "$1,195.19"
                        },
                        extendedPrice: {
                            formattedAmount: "$1,792.78"
                        },
                        extendedPriceWithTax: {
                            formattedAmount: "$2,151.34"
                        }
                    },
                    quantity: 2,
                    url: "~/camcorders/aerial-imaging-drones/3dr-solo-quadcopter-no-gimbal"
                },
                {
                    id: "ad4ae79ffdbc4c97959139a0c387c72e",
                    name: "Samsung Galaxy Note 4 SM-N910C 32GB",
                    imageUrl: "//localhost/admin/assets/catalog/1416164841000_1097106.jpg",
                    price: {
                        actualPrice: {
                            formattedAmount: "$530.99"
                        },
                        actualPriceWithTax: {
                            formattedAmount: "$637.19"
                        },
                        listPrice: {
                            formattedAmount: "$589.99"
                        },
                        listPriceWithTax: {
                            formattedAmount: "$707.99"
                        },
                        extendedPrice: {
                            formattedAmount: "$1,592.97"
                        },
                        extendedPriceWithTax: {
                            formattedAmount: "$1,911.57"
                        }
                    },
                    quantity: 5,
                    url: "~/cell-phones/samsung-galaxy-note-4-sm-n910c-32gb"
                }
            ];
            var dialogData = toDialogDataModelMock(items, rejection);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
        }

        $scope.addProductToCartById = function (productId, quantity, event) {
            event.preventDefault();
            catalogService.getProduct([productId]).then(function (response) {
                if (response.data && response.data.length) {
                    var product = response.data[0];
                    $scope.addProductToCart(product, quantity);
                }
            });
        }

        $scope.addProductToActualQuoteRequest = function (product, quantity) {
            var dialogData = toDialogDataModel(product, quantity);
            dialogService.showDialog(dialogData, 'recentlyAddedActualQuoteRequestItemDialogController', 'storefront.recently-added-actual-quote-request-item-dialog.tpl');
            quoteRequestService.addProductToQuoteRequest(product.id, quantity).then(function (response) {
                $rootScope.$broadcast('actualQuoteRequestItemsChanged');
            });
        }

        function toDialogDataModel(product, quantity) {
            return { items: [angular.extend({ }, product, { quantity: quantity })] };
            //     return {
            //         id: product.id,
            //         name: product.name,
            //         imageUrl: product.primaryImage ? product.primaryImage.url : null,
            //         listPrice: product.price.listPrice,
            //listPriceWithTax: product.price.listPriceWithTax,
            //         placedPrice: product.price.actualPrice,
            //         placedPriceWithTax: product.price.actualPriceWithTax,
            //         quantity: quantity,
            //         updated: false
            //     }
        }

        function toDialogDataModelMock(items, rejection) {
            var dialogDataModel = {};
            if (rejection) {
                dialogDataModel.errorMessage = rejection.data.message;
                dialogDataModel.errors = rejection.data.modelState;
            }
            dialogDataModel.items = items;
            return dialogDataModel;
        }

        function initialize(filters) {
            var product = $window.product;
            if (!product || !product.id) {
                return;
            }
            catalogService.getProduct([product.id]).then(function (response) {
				var product = response.data[0];
                //Current product is also a variation (titular)
                var allVariations = [product].concat(product.variations || []);
                var filteredVariations = allVariations;
                $scope.allVariations.length = 0;
                if (filters) {
                    var variationPropsKeys = Object.keys(filters.terms || {});
                    filteredVariations = _.filter(allVariations, function(variation) {
                        return _.all(variation.variationProperties, function(property) {
                            return !variationPropsKeys.includes(property.displayName) || filters.terms[property.displayName].includes(property.value);
                        });
                    });
                }
                Array.prototype.push.apply($scope.allVariations, filteredVariations);
                angular.copy(_.object(filteredVariations.map(function (variation) { return [variation.id, variation]; })), $scope.allVariationsMap);
                angular.copy(getFlatternDistinctPropertiesMap(allVariations), $scope.allVariationPropsMap);
                angular.copy(_.pick($scope.allVariationPropsMap, function (value, key, object) { return value.length > 1; }), $scope.filterableVariationPropsMap);

                //Auto select initial product as default variation  (its possible because all our products is variations)
                //var propertyMap = getVariationPropertyMap(product);
                //_.each(_.keys(propertyMap), function (x) {
                //    $scope.checkProperty(propertyMap[x][0])
                //});
                $scope.selectedVariation = product;

                return availabilityService.getProductsAvailability([product.id]).then(function(response) {
                    $scope.availability = _.object(_.pluck(response.data, 'productId'), response.data);
                });
            });
        };

        function getFlatternDistinctPropertiesMap(variations) {
            var retVal = {};
            _.each(variations, function (variation) {
                var propertyMap = getVariationPropertyMap(variation);
                //merge
                _.each(_.keys(propertyMap), function (x) {
                    retVal[x] = _.uniq(_.union(retVal[x], propertyMap[x]), "value");
                });
            });
            return retVal;
        };

        function getVariationPropertyMap(variation) {
            return _.groupBy(variation.variationProperties, function (x) { return x.displayName });
        }

        function getSelectedPropsMap(variationPropsMap) {
            var retVal = {};
            _.each(_.keys(variationPropsMap), function (x) {
                var property = _.find(variationPropsMap[x], function (y) {
                    return y.selected;
                });
                if (property) {
                    retVal[x] = [property];
                }
            });
            return retVal;
        }

        function comparePropertyMaps(propMap1, propMap2) {
            return _.every(_.keys(propMap1), function (x) {
                var retVal = propMap2.hasOwnProperty(x);
                if (retVal) {
                    retVal = propMap1[x][0].value == propMap2[x][0].value;
                }
                return retVal;
            });
        };

        //function findVariationBySelectedProps(variations, selectedPropMap) {
        //    return _.find(variations, function (x) {
        //        return comparePropertyMaps(getVariationPropertyMap(x), selectedPropMap);
        //    });
        //}

        ////Method called from View when user clicks one property value
        //$scope.checkProperty = function (property) {
        //    //Select appropriate property and unselect previous selection
        //    _.each($scope.allVariationPropsMap[property.displayName], function (x) {
        //        x.selected = x != property ? false : !x.selected;
        //    });

        //    //try to find the best variation match for selected properties
        //    $scope.selectedVariation = findVariationBySelectedProps(allVariations, getSelectedPropsMap($scope.allVariationPropsMap));
        //};

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
            dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'recentlyAddedCartItemDialogController', 'storefront.send-product-to-email.tpl');
        };

        $scope.$watch('filters', initialize);
    }]);

storefrontApp.controller('recentlyAddedCartItemDialogController', ['$scope', '$window', '$uibModalInstance', 'mailingService', 'dialogData', function ($scope, $window, $uibModalInstance, mailingService, dialogData) {
    $scope.dialogData = dialogData;

    $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.send = function(email) {
        mailingService.sendProduct(dialogData.productId, { email: email, storeId: dialogData.storeId, productUrl: dialogData.productUrl, language: dialogData.language });
        $uibModalInstance.close();
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('quoteRequestController', ['$rootScope', '$scope', '$window', '$location', 'quoteRequestService', 'cartService',
    function ($rootScope, $scope, $window, $location, quoteRequestService, cartService) {
    initialize();

    $scope.setQuoteRequestForm = function (form) {
        $scope.formQuoteRequest = form;
    }

    $scope.displayForStatuses = function (statuses) {
        return _.contains(statuses, $scope.quoteRequest.status);
    }

    $scope.addTierPrice = function (quoteItem) {
        quoteItem.proposalPrices.push({
            id: quoteItem.proposalPrices.length + 1,
            price: quoteItem.salePrice,
            quantity: 1
        });
    }

    $scope.changeTierPriceQuantity = function (tierPrice, quantity) {
        if (quantity < 1 || quantity.isNaN) {
            return;
        }
        tierPrice.quantity = quantity;
    }

    $scope.removeTierPrice = function (quoteItem, tierPrice) {
        quoteItem.proposalPrices = _.without(quoteItem.proposalPrices, tierPrice);
    }

    $scope.removeProductFromQuoteRequest = function (quoteItem) {
        var initialQuoteItems = angular.copy($scope.quoteRequest.items);
        $scope.quoteRequest.items = _.without($scope.quoteRequest.items, quoteItem);
        quoteRequestService.removeProductFromQuoteRequest($scope.quoteRequest.id, quoteItem.id).then(function (response) {
            getQuoteRequest($scope.quoteRequest.id);
            $rootScope.$broadcast('actualQuoteRequestItemsChanged');
        }, function (response) {
            $scope.quoteRequest.items = initialQuoteItems;
        });
    }

    $scope.setCountry = function (addressType, countryName) {
        var country = _.find($scope.countries, function (c) { return c.name == countryName });
        if (!country) {
            return;
        }
        if (addressType == 'Billing') {
            $scope.billingCountry = country;
            $scope.billingCountryRegions = [];
            $scope.quoteRequest.billingAddress.countryCode = country.code3 || country.code2;
            $scope.quoteRequest.billingAddress.regionId = null;
            $scope.quoteRequest.billingAddress.regionName = null;
        }
        if (addressType == 'Shipping') {
            $scope.shippingCountry = country;
            $scope.shippingCountryRegions = [];
            $scope.quoteRequest.shippingAddress.countryCode = country.code3 || country.code2;
            $scope.quoteRequest.shippingAddress.regionId = null;
            $scope.quoteRequest.shippingAddress.regionName = null;
        }
        if (country.code3) {
            getCountryRegions(addressType, country.code3);
        }
    }

    $scope.setCountryRegion = function (addressType) {
        if (addressType == 'Billing') {
            var countryRegion = _.find($scope.billingCountryRegions, function (r) { return r.name == $scope.quoteRequest.billingAddress.regionName });
            if (!countryRegion) {
                return;
            }
            $scope.quoteRequest.billingAddress.regionId = countryRegion.code;
        }
        if (addressType == 'Shipping') {
            var countryRegion = _.find($scope.shippingCountryRegions, function (r) { return r.name == $scope.quoteRequest.shippingAddress.regionName });
            if (!countryRegion) {
                return;
            }
            $scope.quoteRequest.shippingAddress.regionId = countryRegion.code;
        }
    }

    $scope.selectCustomerAddress = function (addressType) {
        if (addressType === 'Billing') {
            var billingAddress = _.find($scope.customer.addresses, function (a) { return a.id === $scope.quoteRequest.billingAddress.id });
            if (billingAddress) {
                billingAddress.type = 'Billing';
                if (billingAddress.countryCode) {
                    getCountryRegions('Billing', billingAddress.countryCode);
                }
                $scope.quoteRequest.billingAddress = angular.copy(billingAddress);
            }
        }
        if (addressType === 'Shipping') {
            var shippingAddress = _.find($scope.customer.addresses, function (a) { return a.id === $scope.quoteRequest.shippingAddress.id });
            if (shippingAddress) {
                shippingAddress.type = 'Shipping';
                if (shippingAddress.countryCode) {
                    getCountryRegions('Shipping', shippingAddress.countryCode);
                }
                $scope.quoteRequest.shippingAddress = angular.copy(shippingAddress);
            }
        }
    }

    $scope.stringifyAddress = function (address) {
        if (!address) {
            return;
        }
        var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
        stringifiedAddress += address.organization ? address.organization + ', ' : '';
        stringifiedAddress += address.countryName + ', ';
        stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
        stringifiedAddress += address.city + ' ';
        stringifiedAddress += address.line1 + ', ';
        stringifiedAddress += address.line2 ? address.line2 : '';
        stringifiedAddress += address.postalCode;
        return stringifiedAddress;
    }

    $scope.submitQuoteRequest = function () {
        $scope.formQuoteRequest.$setSubmitted();
        if ($scope.formQuoteRequest.$invalid) {
            return;
        }
        $scope.quoteRequest.billingAddress.email = $scope.quoteRequest.email;
        if ($scope.quoteRequest.shippingAddress) {
            $scope.quoteRequest.shippingAddress.email = $scope.quoteRequest.email;
        }
        quoteRequestService.submitQuoteRequest($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            if ($scope.customer.isRegisteredUser) {
                $scope.outerRedirect($scope.baseUrl + 'account/quoterequests');
            } else {
                $scope.outerRedirect($scope.baseUrl + 'account/login');
            }
        });
    }

    $scope.rejectQuoteRequest = function () {
        quoteRequestService.rejectQuoteRequest($scope.quoteRequest.id).then(function (response) {
            quoteRequestService.getQuoteRequest($scope.quoteRequest.id).then(function (response) {
                $scope.quoteRequest = response.data;
            });
        });
    }

    $scope.selectTierPrice = function () {
        quoteRequestService.getTotals($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            $scope.quoteRequest.totals = response.data;
        });
    }

    $scope.confirmQuoteRequest = function () {
        quoteRequestService.confirmQuoteRequest($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout/#/shipping-address');
        });
    }

    $scope.setRequestShippingQuote = function () {
        if (!$scope.quoteRequest.requestShippingQuote) {
            $scope.quoteRequest.shippingAddress = null;
        }
    }

    $scope.setShippingAddressEqualsBilling = function () {
        if ($scope.quoteRequest.shippingAddressEqualsBilling) {
            $scope.quoteRequest.shippingAddress = angular.copy($scope.quoteRequest.billingAddress);
            $scope.quoteRequest.shippingAddress.type = 'Shipping';
            if ($scope.quoteRequest.shippingAddress.countryCode) {
                $scope.shippingCountry = $scope.billingCountry;
                getCountryRegions('Shipping', $scope.quoteRequest.shippingAddress.countryCode);
            }
        }
    }

    $scope.tierPricesUnique = function (quoteItem) {
        var quantities = _.map(quoteItem.proposalPrices, function (p) { return p.quantity });
        return _.uniq(quantities).length == quoteItem.proposalPrices.length;
    }

    function initialize() {
        var quoteRequestNumber = $location.url().replace('/', '') || $window.currentQuoteRequestNumber;
        $scope.billingCountry = null;
        $scope.shippingCountry = null;
        getCountries();
        if (quoteRequestNumber) {
            getQuoteRequest(quoteRequestNumber);
        } else {
            $scope.quoteRequest = { itemsCount: 0 };
        }
    }

    function getQuoteRequest(number) {
        quoteRequestService.getQuoteRequest(number).then(function (response) {
            var quoteRequest = response.data;
            if (!quoteRequest.billingAddress) {
                if ($scope.customer.addresses.length) {
                    quoteRequest.billingAddress = angular.copy($scope.customer.addresses[0]);
                    quoteRequest.billingAddress.type = 'Billing';
                    if (quoteRequest.billingAddress.countryCode) {
                        getCountryRegions('Billing', quoteRequest.billingAddress.countryCode);
                    }
                } else {
                    quoteRequest.billingAddress = {
                        firstName: $scope.customer.firstName,
                        lastName: $scope.customer.lastName
                    };
                }
            }
            _.each(quoteRequest.items, function (quoteItem) {
                var i = 1;
                _.each(quoteItem.proposalPrices, function (tierPrice) {
                    tierPrice.id = i;
                    if (quoteItem.selectedTierPrice.quantity == tierPrice.quantity) {
                        quoteItem.selectedTierPrice = tierPrice;
                    }
                    i++;
                });
            });
            quoteRequest.requestShippingQuote = true;
            $scope.quoteRequest = quoteRequest;
        });
    }

    function getCountries() {
        cartService.getCountries().then(function (response) {
            $scope.countries = response.data;
        });
    }

    function getCountryRegions(addressType, countryCode) {
        cartService.getCountryRegions(countryCode).then(function (response) {
            var countryRegions = response.data;
            if (addressType == 'Billing') {
                $scope.billingCountryRegions = countryRegions || [];
            }
            if (addressType == 'Shipping') {
                $scope.shippingCountryRegions = countryRegions || [];
            }
        });
    }

    function toFormModel(quoteRequest) {
        var quoteRequestFormModel = {
            id: quoteRequest.id,
            tag: quoteRequest.tag,
            status: quoteRequest.status,
            comment: quoteRequest.comment,
            billingAddress: quoteRequest.billingAddress,
            shippingAddress: quoteRequest.shippingAddress,
            items: []
        };
        _.each(quoteRequest.items, function (quoteItem) {
            var quoteItemFormModel = {
                id: quoteItem.id,
                comment: quoteItem.comment,
                selectedTierPrice: {
                    price: quoteItem.selectedTierPrice.price.amount,
                    quantity: quoteItem.selectedTierPrice.quantity
                },
                proposalPrices: []
            };
            _.each(quoteItem.proposalPrices, function (tierPrice) {
                quoteItemFormModel.proposalPrices.push({
                    price: tierPrice.price.amount,
                    quantity: tierPrice.quantity
                });
            });
            quoteRequestFormModel.items.push(quoteItemFormModel);
        });

        return quoteRequestFormModel;
    }
}]);

storefrontApp.controller('actualQuoteRequestBarController', ['$scope', 'quoteRequestService', function ($scope, quoteRequestService) {
    getCurrentQuoteRequest();

    $scope.$on('actualQuoteRequestItemsChanged', function (event, data) {
        getCurrentQuoteRequest();
    });

    function getCurrentQuoteRequest() {
        quoteRequestService.getCurrentQuoteRequest().then(function (response) {
            $scope.actualQuoteRequest = response.data;
        });
    }
}]);

storefrontApp.controller('recentlyAddedActualQuoteRequestItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData',
    function ($scope, $window, $uibModalInstance, dialogData) {

    $scope.$on('actualQuoteRequestItemsChanged', function (event, data) {
        dialogData.updated = true;
    });

    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }
}]);
var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recommendationsController', ['$scope', '$timeout', 'recommendationService', function ($scope, $timeout, recommendationService) {
   
    $scope.isBlockVisible = false;
    $scope.productListRecommendationsLoaded = false;
    $scope.productListRecommendations = [];
   
    $scope.getRecommendations = function (evalContext) {
     
        if (_.isString(evalContext.productIds)) {
            if (evalContext.productIds.match(",")) {
                var values = evalContext.productIds.split(',');
                evalContext.productIds = values;
            }
            else {
                evalContext.productIds = [evalContext.productIds];
            }
        }
        recommendationService.getRecommendedProducts(evalContext).then(function (response) {
            var products = response.data;
            if (products.length) {
                for (var i = 0; i < products.length; i++) {
                    $scope.productListRecommendations.push(products[i]);
                }

                $scope.isBlockVisible = products.length > 0;
            }

            $scope.productListRecommendationsLoaded = true;            
        });
    }
    $scope.startRecordInteraction = function () {
        //Necessary condition for ensure what angularjs rendering process finished
        $timeout(function () {
           window.startRecordInteraction();
        });
    }
}]);
var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('dialogService', ['$uibModal', function ($uibModal) {
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
            return modalInstance;
        }
    }
}]);

storefrontApp.service('mailingService', ['$http', 'apiBaseUrl', function ($http, apiBaseUrl) {
    return {
        sendProduct: function(id, data) {
            return $http.post(apiBaseUrl + 'api/b2b/send/product/' + id, data);
        }
    }
}]);

storefrontApp.service('feedbackService', ['$http', function ($http) {
    return {
        postFeedback: function (data) {
            return $http.post('storefrontapi/feedback', { model: data });
        }
    }
}]);

storefrontApp.service('customerService', ['$http', function ($http) {
    return {
        getCurrentCustomer: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('marketingService', ['$http', function ($http) {
    return {
        getDynamicContent: function (placeName) {
            return $http.get('storefrontapi/marketing/dynamiccontent/' + placeName + '?t=' + new Date().getTime());
        },
    }
}]);

storefrontApp.service('pricingService', ['$http', function ($http) {
	return {
		getActualProductPrices: function (products) {
		    return $http.post('storefrontapi/pricing/actualprices', products);
		}
	}
}]);

storefrontApp.service('catalogService', ['$http', function ($http) {
    return {
        getProduct: function (productIds) {
            return $http.get('storefrontapi/products?productIds=' + productIds + '&t=' + new Date().getTime());
        },
        getProducts: function(productIds) {
            return $http.get('storefrontapi/products?' + productIds + '&t=' + new Date().getTime());
        },
        search: function (criteria) {
            return $http.post('storefrontapi/catalog/search', criteria);
        },
        searchCategories: function (criteria) {
            return $http.post('storefrontapi/categories/search', criteria);
        }
    }
}]);

storefrontApp.service('cartService', ['$http', function ($http) {
    return {
        getCart: function () {
            return $http.get('storefrontapi/cart?t=' + new Date().getTime());
        },
        getCartItemsCount: function () {
            return $http.get('storefrontapi/cart/itemscount?t=' + new Date().getTime());
        },
        addLineItem: function (productId, quantity) {
            return $http.post('storefrontapi/cart/items', { id: productId, quantity: quantity });
        },
        changeLineItemQuantity: function (lineItemId, quantity) {
            return $http.put('storefrontapi/cart/items', { lineItemId: lineItemId, quantity: quantity });
        },
        changeLineItemsQuantity: function(items) {
            return $http.put('storefrontapi/cart/items', items);
        },
        removeLineItem: function (lineItemId) {
            return $http.delete('storefrontapi/cart/items?lineItemId=' + lineItemId);
        },
        changeLineItemPrice: function (lineItemId, newPrice) {
        	return $http.put('storefrontapi/cart/items/price', { lineItemId: lineItemId, newPrice: newPrice});
        },
        clearCart: function () {
            return $http.post('storefrontapi/cart/clear');
        },
        getCountries: function () {
            return $http.get('storefrontapi/countries?t=' + new Date().getTime());
        },
        getCountryRegions: function (countryCode) {
        	return $http.get('storefrontapi/countries/' + countryCode + '/regions?t=' + new Date().getTime());
        },
        addCoupon: function (couponCode) {
            return $http.post('storefrontapi/cart/coupons/' + couponCode);
        },
        removeCoupon: function () {
            return $http.delete('storefrontapi/cart/coupons');
        },
        addOrUpdateShipment: function (shipment) {
            return $http.post('storefrontapi/cart/shipments', shipment);
        },
        addOrUpdatePayment: function (payment) {
            return $http.post('storefrontapi/cart/payments', payment );
        },
        getAvailableShippingMethods: function (shipmentId) {
            return $http.get('storefrontapi/cart/shipments/' + shipmentId + '/shippingmethods?t=' + new Date().getTime());
        },
        getAvailablePaymentMethods: function () {
            return $http.get('storefrontapi/cart/paymentmethods?t=' + new Date().getTime());
        },
        addOrUpdatePaymentPlan: function (plan) {
            return $http.post('storefrontapi/cart/paymentPlan', plan);
        },
        removePaymentPlan: function () {
            return $http.delete('storefrontapi/cart/paymentPlan');
        },
        createOrder: function (bankCardInfo) {
            return $http.post('storefrontapi/cart/createorder', { bankCardInfo: bankCardInfo });
        }
    }
}]);

storefrontApp.service('listService', ['$q', '$http', '$localStorage', 'customerService', function ($q, $http, $localStorage, customerService) {
    return {
        getOrCreateMyLists: function (userName, lists) {
            if (!$localStorage['lists']) {
                $localStorage['lists'] = {};
                $localStorage['lists'][userName] = [];
                $localStorage['sharedListsIds'] = {};
                $localStorage['sharedListsIds'][userName] = [];
                _.each(lists, function (list) {
                    list.author = userName;
                    list.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
                });
                _.extend($localStorage['lists'][userName], lists);
            }
            return $q(function (resolve, reject) { resolve($localStorage['lists'][userName]) });
        },

        getSharedLists: function (userName) {
            var lists = $localStorage['lists'];
            var sharedLists = [];
            if ($localStorage['sharedListsIds']) {
                _.each($localStorage['sharedListsIds'][userName], function(cartId) {
                    _.each(lists, function(list) {
                        if (angular.isDefined(_.find(list, { id: cartId.toString() }))) {
                            sharedLists.push(_.find(list, { id: cartId }));
                        }

                    });
                });
            }
            return $q(function (resolve, reject) { resolve(sharedLists) });
        },
        getWishlist: function (listName, permission, id, userName) {
            if (_.contains($localStorage['lists'][userName], _.find($localStorage['lists'][userName], { name: listName })) && angular.isDefined(userName)) {
                $localStorage['lists'][userName].push({ name: listName + 1, permission: permission, id: id, items: [], author: userName });
            }
            else $localStorage['lists'][userName].push({ name: listName, permission: permission, id: id, items: [], author: userName })

            return _.find($localStorage['lists'][userName], { name: listName });
        },

        addItemToList: function (listId, product) {
            _.each($localStorage['lists'], function(list) {
                if (angular.isDefined(_.find(list, { id: listId }))) {
                    var searchedList = _.find(list, { id: listId });
                    searchedList.items.push(product);
                }

            });
        },

        containsInList: function (productId, cartId) {
            var lists = angular.copy($localStorage['lists']);
            var contains;
            _.each(lists, function(list) {
                if (angular.isDefined(_.find(list, { id: cartId }))) {
                    var currentList = _.find(list, { id: cartId });
                    if (angular.isDefined(_.find(currentList.items, { productId: productId })))
                        contains = true;
                    else
                        contains = false;
                }
            });
            return $q(function (resolve, reject) { resolve({ contains: contains }) });
        },

        addSharedList: function (userName, myLists, sharedCartId) {
            if (!_.some($localStorage['sharedListsIds'][userName], function (x) { return x === sharedCartId }) && (!_.find(myLists, { id: sharedCartId }))) {
                $localStorage['sharedListsIds'][userName].push(sharedCartId);
                return $q(function (resolve, reject) {
                    resolve();
                });
            }
            else return $q(function (resolve, reject) {
                resolve();
            });
        },

        contains: function (productId, listName) {
            return $http.get('storefrontapi/lists/' + listName + '/items/' + productId + '/contains?t=' + new Date().getTime());
        },
        addLineItem: function (productId, listName) {
            return $http.post('storefrontapi/lists/' + listName + '/items', { productId: productId });
        },

        removeLineItem: function (lineItemId, listId, userName) {
            var searchedList = _.find($localStorage['lists'][userName], { id: listId });
            searchedList.items = _.filter(searchedList.items, function (item) { return item.id != lineItemId });
            return $q(function (resolve, reject) {
                resolve(searchedList)
            });
            //return $http.delete('storefrontapi/lists/' + listName + '/items/' + lineItemId);
        },
        clearList: function (cartId, userName) {
            $localStorage['lists'][userName] = _.filter($localStorage['lists'][userName], function (x) { return x.id != cartId });
            //return $http.post('storefrontapi/lists/clear', { listName: listName });
        },
        removeFromFriendsLists: function (currentId, userName) {
            $localStorage['sharedListsIds'][userName] = _.filter($localStorage['sharedListsIds'][userName], function(cartId) {
                return $q(function(resolve, reject) {
                    resolve(cartId !== currentId)
                });
            });
        }
    }
}]);

storefrontApp.service('quoteRequestService', ['$http', function ($http) {
    return {
        getCurrentQuoteRequest: function () {
            return $http.get('storefrontapi/quoterequest/current?t=' + new Date().getTime());
        },
        getQuoteRequest: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '?t=' + new Date().getTime());
        },
        getQuoteRequestItemsCount: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '/itemscount?t=' + new Date().getTime());
        },
        addProductToQuoteRequest: function (productId, quantity) {
            return $http.post('storefrontapi/quoterequests/current/items', { productId: productId, quantity: quantity });
        },
        removeProductFromQuoteRequest: function (quoteRequestNumber, quoteItemId) {
            return $http.delete('storefrontapi/quoterequests/' + quoteRequestNumber + '/items/' + quoteItemId);
        },
        submitQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/submit', { quoteForm: quoteRequest });
        },
        rejectQuoteRequest: function (quoteRequestNumber) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/reject');
        },
        updateQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.put('storefrontapi/quoterequests/' + quoteRequestNumber + '/update', { quoteRequest: quoteRequest });
        },
        getTotals: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/totals', { quoteRequest: quoteRequest });
        },
        confirmQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/confirm', { quoteRequest: quoteRequest });
        }
    }
}]);

storefrontApp.service('recommendationService', ['$http', function ($http) {
    return {
        getRecommendedProducts: function (requestData) {
            return $http.post('storefrontapi/recommendations', requestData );
        }
    }
}]);

storefrontApp.service('orderService', ['$http', function ($http) {
    return {
        getOrder: function (orderNumber) {
            return $http.get('storefrontapi/orders/' + orderNumber + '?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('compareProductService', ['$http', '$localStorage', function($http, $localStorage) {
    return {
        isInProductCompareList: function(productId) {
            var containProduct;
            if (!_.some($localStorage['productCompareListIds'], function(id) { return id === productId })) {
                containProduct = false;
            }
            else
                containProduct = true
            return containProduct;
        },
        addProduct: function(productId) {
            if (!$localStorage['productCompareListIds']) {
                $localStorage['productCompareListIds'] = [];
            }
            $localStorage['productCompareListIds'].push(productId);
            _.uniq($localStorage['productCompareListIds']);
        },
        getProductsIds: function() {
            if (!$localStorage['productCompareListIds']) {
                $localStorage['productCompareListIds'] = [];
                return;
            }
            var ids = [];
            for (i = 0; i < $localStorage['productCompareListIds'].length; i++) {
                ids.push('productIds=' + $localStorage['productCompareListIds'][i]);
            }
            return ids.join("&");
        },
        getProductsCount: function() {
            var count = $localStorage['productCompareListIds'] ? $localStorage['productCompareListIds'].length : 0;
            return count;
        },
        clearCompareList: function() {
            $localStorage['productCompareListIds'] = [];
        },
        removeProduct: function(productId) {
            $localStorage['productCompareListIds'] = _.without($localStorage['productCompareListIds'], productId);
        }
    }
}]);

(function () {
    window.Toc.helpers.findOrFilter = function($el, selector) {
        var $descendants = $el.find(selector);
        return $el.filter(selector).add($descendants).filter(':not([data-toc-skip])').filter(function () {
            return !$(this).parents("[data-toc-skip]").length;
        });
    };

    // from https://github.com/afeld/bootstrap-toc/pull/37
    window.Toc.helpers.generateEmptyNavEl = function() {
        var $li = $('<li></li>');
        return $li;
    };

    window.Toc.helpers.getHeadings = function($scope, depth, topLevel) {
        var selector = '';
        for (var i = topLevel; i < topLevel + depth; i++) {
            selector += 'h' + i;
            if (i < topLevel + depth - 1)
                selector += ',';
        }
        return this.findOrFilter($scope, selector);
    };

    window.Toc.helpers.populateNav = function($topContext, depth, topLevel, $headings) {
        var $contexts = new Array(depth);
        var helpers = this;

        $contexts[0] = $topContext;
        $topContext.lastNav = null;

        $headings.each(function(i, el) {
            var $newNav = helpers.generateNavItem(el);
            var navLevel = helpers.getNavLevel(el);
            var relLevel = navLevel - topLevel;
            var j;

            for (j = relLevel + 1; j < $contexts.length; j++) {
                $contexts[j] = null;
            }

            if (!$contexts[relLevel]) {
                for (j = 0; j < relLevel; j++) {
                    if (!$contexts[j + 1]) {
                        if (!$contexts[j].lastNav) {
                            var $emptyNav = helpers.generateEmptyNavEl();
                            $contexts[j].append($emptyNav);
                            $contexts[j].lastNav = $emptyNav;
                        }
                        $contexts[j + 1] = helpers.createChildNavList($contexts[j].lastNav);
                        $contexts[j + 1].lastNav = null;
                    }
                }
            }

            $contexts[relLevel].append($newNav);
            $contexts[relLevel].lastNav = $newNav;
        });
    };

    window.Toc.helpers.parseOps = function(arg) {
        var opts;
        if (arg.jquery) {
            opts = {
                $nav: arg
            };
        } else {
            opts = arg;
        }
        opts.$scope = opts.$scope || $(document.body);
        opts.depth = opts.depth || opts.$nav.attr('data-toc-depth') || 2;
        return opts;
    };

    window.Toc.init = function(opts) {
        opts = this.helpers.parseOps(opts);

        // ensure that the data attribute is in place for styling
        opts.$nav.attr('data-toggle', 'toc');

        var $topContext = this.helpers.createChildNavList(opts.$nav);
        var topLevel = this.helpers.getTopLevel(opts.$scope);
        var $headings = this.helpers.getHeadings(opts.$scope, opts.depth, topLevel);
        this.helpers.populateNav($topContext, opts.depth, topLevel, $headings);
    };
})();

//# sourceMappingURL=scripts.js.map
