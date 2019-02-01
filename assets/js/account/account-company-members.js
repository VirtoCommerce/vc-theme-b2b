angular.module('storefront.account')
    .component('vcAccountCompanyMembers', {
        templateUrl: "themes/assets/account-company-members.tpl.liquid",
        $routeConfig: [
            { path: '/', name: 'MemberList', component: 'vcAccountCompanyMembersList', useAsDefault: true },
            { path: '/:member', name: 'MemberDetail', component: 'vcAccountCompanyMemberDetail' }
        ],
        controller: ['storefrontApp.mainContext', function (mainContext) {
            var $ctrl = this;
        }]
    })

    .component('vcAccountCompanyMembersList', {
        templateUrl: "account-company-members-list.tpl",
        bindings: { $router: '<' },
        controller: ['storefrontApp.mainContext', '$scope', 'accountApi', 'loadingIndicatorService', 'confirmService', '$location', '$translate', '$log', '$timeout', function (mainContext, $scope, accountApi, loader, confirmService, $location, $translate, $log, $timeout) {
            var $ctrl = this;
            $ctrl.currentMemberId = mainContext.customer.id;
            $ctrl.newMemberComponent = null;
            $ctrl.loader = loader;
            $ctrl.alerts = {
                editMember: {
                    level: null,
                    errors: undefined,
                    errorMessage: undefined
                },
                newMember: {
                    level: null,
                    errors: undefined,
                    errorMessage: undefined
                },
            };
            $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
            $ctrl.pageSettings.pageChanged = function () { refresh(); };

            function refresh() {
                $ctrl.errors = undefined;
                loader.wrapLoading(function () {
                    return accountApi.searchOrganizationUsers({
                        skip: ($ctrl.pageSettings.currentPage - 1) * $ctrl.pageSettings.itemsPerPageCount,
                        take: $ctrl.pageSettings.itemsPerPageCount,
                        sortInfos: $ctrl.sortInfos
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;                       
                        $ctrl.pageSettings.totalItems = response.data.totalCount;
                    });
                });
            };

            $ctrl.addNewMemberFieldsConfig = [
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
                    visible: true
                },
                {
                    field: 'Roles',
                    disabled: false,
                    visible: true,
                    required: true
                }
            ];

            $scope.init = function (storeId, cultureName, registrationUrl) {
                $ctrl.storeId = storeId;
                $ctrl.cultureName = cultureName;
                $ctrl.registrationUrl = registrationUrl;
            };

            this.$routerOnActivate = function (next) {
                $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
                refresh();
            };

            $ctrl.inviteEmailsValidationPattern = new RegExp(/((^|((?!^)([,;]|\r|\r\n|\n)))([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))+$/);
            $ctrl.invite = function () {
                $ctrl.inviteInfo.emails = $ctrl.inviteInfo.rawEmails.split(/[,;]|\r|\r\n|\n/g);
                loader.wrapLoading(function () {
                    return accountApi.createInvitation({
                        emails: $ctrl.inviteInfo.emails,
                        message: $ctrl.inviteInfo.message
                    }).then(function(response) {
                        if (response.data.succeeded) {
                            $ctrl.cancel();
                            refresh();
                        }
                        else {
                            $ctrl.errors = _.pluck(response.data.errors, 'description');
                        }
                       
                    });
                });
            };

            $ctrl.addNewMember = function () {
                if ($ctrl.newMemberComponent.validate()) {
                    $ctrl.newMember.organizationId = mainContext.customer.organizationId;
                    $ctrl.newMember.role = $ctrl.newMember.role ? $ctrl.newMember.role.id : undefined;
                    $ctrl.newMember.storeId = $ctrl.storeId;

                    loader.wrapLoading(function () {
                        return accountApi.registerNewUser($ctrl.newMember).then(function(response) {
                            if (response.data.succeeded) {
                                $ctrl.throwAlert('newMember', 'success', 'new user added', undefined);
                                //Give user time to look at the alert
                                $timeout($ctrl.applyNewUser, 3000);
                            }
                            else {
                                $ctrl.throwAlert('newMember', 'danger', undefined, response.data.errors);
                            }
                        });
                    });
                }
            };

            $ctrl.throwAlert = function (key, level, message, errors) {
                $ctrl.alerts[key].level = undefined;
                $ctrl.alerts[key].errorMessage = undefined;
                $ctrl.alerts[key].errors = null;
                $ctrl.alerts[key].level = level;
                $ctrl.alerts[key].errorMessage = message;
                $ctrl.alerts[key].errors = _.pluck(errors, 'description');
            };

            $ctrl.applyNewUser = function () {
                $ctrl.cancel();
                $ctrl.pageSettings.currentPage = 1;
                $ctrl.pageSettings.pageChanged();
            };

            $ctrl.cancel = function () {
                $ctrl.inviteInfo = null;
                $ctrl.newMember = null;
                $ctrl.editMember = null;
                $ctrl.errorMessage = null;
            };

            $ctrl.changeStatus = function (member) {
                loader.wrapLoading(function () {
                    var action = member.isLockedOut ? accountApi.unlockUser : accountApi.lockUser;
                    member.isLockedOut = !member.isLockedOut;
                    return action(member.id).then(function (response) {
                        if (response.data.succeeded) {
                            refresh();
                            $ctrl.editMember = true;
                            $ctrl.throwAlert('editMember', 'success', member.isLockedOut ? `user ${member.userName} deactivated` : `user ${member.userName} activated`, undefined);
                            //Give user time to look at the alert
                            $timeout(function (){
                                $ctrl.cancel();
                            }, 3000);
                        }
                        else {
                            $ctrl.editMember = true;
                            $ctrl.throwAlert('editMember', 'danger', undefined, response.data.errors);
                        }
                    });
                });
            };

            $ctrl.edit = function (memberId) {
                this.$router.navigate(['MemberDetail', { member: memberId, pageNumber: $ctrl.pageSettings.currentPage }]);
            }

            $ctrl.delete = function (member) {
                var showDialog = function (text) {
                    confirmService.confirm(text).then(function (confirmed) {
                        if (confirmed) {
                            loader.wrapLoading(function () {
                                return accountApi.deleteUser(member.id).then(function(response) {
                                    if (response.data.succeeded) {
                                        refresh();
                                        $ctrl.editMember = true;
                                        $ctrl.throwAlert('editMember', 'success', `user ${member.userName} deleted`, undefined);
                                        $timeout(function(){
                                            $ctrl.cancel();
                                        }, 3000);
                                    }
                                    else {
                                        $ctrl.editMember = true;
                                        $ctrl.throwAlert('editMember', 'danger', undefined, response.data.errors);
                                    }
                                });
                            });
                        }
                    });
                };

                $translate('customer.edit_company_members.delete_confirm').then(showDialog, showDialog);
            };

            $ctrl.validate = function () {
                $ctrl.inviteForm.$setSubmitted();
                return $ctrl.inviteForm.valid;
            };

            $ctrl.showActions = function (member) {
                return member.id != mainContext.customer.id;
            }
        }]
    });
