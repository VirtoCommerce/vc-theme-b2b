angular.module('storefront.account')
.factory('authService', ['$http', '$interpolate', function ($http, $interpolate) {
    var serviceBase = 'api/platform/security/';
    var authContext = {
        userId: null,
        userLogin: null,
        fullName: null,
        userType: null,
        roles: null,
        permissions: null,
        isAuthenticated: false
    };

    authContext.fillAuthData = function() {
        // temporary mock
        changeAuth({
            apiAccounts: [],
            email: "b2b-test-user@example.com",
            id: "7a7e3a91-d510-4913-9745-49d809614ed8",
            isAdministrator: false,
            memberId: "7a7e3a91-d510-4913-9745-49d809614ed8",
            permissions: ["storefront:companyInfo:access", "storefront:companyMembers:access", "catalog:access", "catalog:read"],
            roles: [
                {
                    id: "12dc3bacf2a34c8d9f72dea5468f1f5a",
                    name: "B2B Company",
                    permissions: [
                        {
                            assignedScopes: [],
                            availableScopes: [],
                            description: "",
                            id: "storefront:companyInfo:access",
                            name: "Open company info view"
                        },
                        {
                            assignedScopes: [],
                            availableScopes: [],
                            description: "",
                            id: "catalog:access",
                            name: "Open catalogs menu"
                        },
                        {
                            assignedScopes: [
                                {
                                    label: "Electronics",
                                    scope: "4974648a41df4e6ea67ef2ad76d7bbd4",
                                    type: "CatalogSelectedScope"
                                }
                            ],
                            availableScopes: [
                                { type: "CatalogSelectedScope" },
                                { type: "CatalogSelectedCategoryScope" }
                            ],
                            description: "",
                            id: "catalog:read",
                            name: "View catalog related data"
                        }
                    ]
                }
            ],
            storeId: "Electronics",
            userName: "b2btestuser",
            userState: "Approved",
            userType: "Customer"
        });
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
}]);