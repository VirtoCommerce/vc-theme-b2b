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
        $auth.login($httpParamSerializerJQLike({
                userName: login,
                password: password,
                grant_type: "password"
            }),
            { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
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
.config(['$authProvider', '$provide', 'apiBaseUrl', function($authProvider, $provide, apiBaseUrl) {
    $authProvider.loginUrl = apiBaseUrl + 'Token';
    $authProvider.tokenName = 'access_token';
    $authProvider.tokenPrefix = 'platform';
    $authProvider.oauth2({
      name: 'platform',
      clientId: 'web'
    });
    $provide.decorator('SatellizerShared', ['$delegate', 'tokenExpirationName', function($delegate, tokenExpirationName){
        var service = $delegate;
        var originalSetToken = service.setToken;
        service.setToken = function(response){
            originalSetToken.apply($delegate, arguments);
            var expirationTime = Date.parse(response.data['.expires']);
            this.SatellizerStorage.set(tokenExpirationName, expirationTime);;
        };
        return $delegate;
    }]);
}])
.run(['$auth', 'SatellizerConfig', 'SatellizerStorage', 'tokenExpirationName', '$timeout', '$window', '$location', function($auth, $authProvider, $authStorage, tokenExpirationName, $timeout, $window, $location) {
    var logOut = function(){
        $auth.logout();
        $authStorage.remove(tokenExpirationName);
        $window.location.href = $location.protocol() + "://" + $location.host() + ":" + $location.port() + '/account/logout';
    };

    if ($auth.isAuthenticated()){
        var t = parseFloat($authStorage.get(tokenExpirationName)) - Date.now();
        $timeout(logOut, t);
    }
}]);