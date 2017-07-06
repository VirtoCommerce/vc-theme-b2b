var apiUrlPrefix = 'http://localhost/admin/';
//var apiUrlPrefix = 'http://demovc-admin-dev.azurewebsites.net/';

angular.module('storefront.account')
.factory('storefront.corporateAccountApi', ['$resource', function ($resource) {
    return $resource(apiUrlPrefix + 'api/b2b/companyMembers', {}, {
        getCompanyById: { url: apiUrlPrefix + 'api/b2b/company/:id' },
        updateCompany: { url: apiUrlPrefix + 'api/b2b/company', method: 'POST' },

        getCompanyMembers: { url: apiUrlPrefix + 'api/b2b/companyMembers', method: 'POST' },
        getCompanyMember: { url: apiUrlPrefix + 'api/b2b/companyMember/:id' },
        updateCompanyMember: { url: apiUrlPrefix + 'api/b2b/companyMember', method: 'POST' },
        deleteCompanyMember: { url: apiUrlPrefix + 'api/b2b/companyMembers', method: 'DELETE' },

        invite: { url: apiUrlPrefix + 'api/b2b/invite', method: 'POST' }
    });
}])
.factory('storefront.corporateRegisterApi', ['$resource', function ($resource) {
    return $resource(apiUrlPrefix + 'api/b2b/register', {}, {
        register: { url: apiUrlPrefix + 'api/b2b/register', method: 'POST' },
        registerMember: { url: apiUrlPrefix + 'api/b2b/registerMember', method: 'POST' },
        registerByInvite: { url: apiUrlPrefix + 'api/b2b/register/:invite', method: 'POST' }
    });
}])
.factory('storefront.accountsApi', ['$resource', function ($resource) {
    return $resource(apiUrlPrefix + 'api/platform/security/users/:id', { id: '@Id' }, {
        search: { method: 'POST' },
        save: { url: apiUrlPrefix + 'api/platform/security/users/create', method: 'POST' },
        update: { method: 'PUT' }
    });
}])
.factory('storefront.rolesApi', ['$resource', function ($resource) {
    return $resource(apiUrlPrefix + 'api/platform/security/roles/:id', { id: '@Id' }, {
        search: { method: 'POST' },
        queryPermissions: { url: apiUrlPrefix + 'api/platform/security/permissions', isArray: true },
        update: { method: 'PUT' }
    });
}]);