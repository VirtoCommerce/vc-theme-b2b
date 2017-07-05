angular.module('storefront.account')
.factory('storefront.corporateAccountApi', ['$resource', function ($resource) {
    var urlPrefix = 'http://localhost/admin/';
    //var urlPrefix = 'http://demovc-admin-dev.azurewebsites.net/';

    return $resource(urlPrefix + 'api/b2b/companyMembers', {}, {
        getCompanyById: { url: urlPrefix + 'api/b2b/company/:id' },
        updateCompany: { url: urlPrefix + 'api/b2b/company', method: 'POST' },

        getCompanyMembers: { url: urlPrefix + 'api/b2b/companyMembers', method: 'POST' },
        getCompanyMember: { url: urlPrefix + 'api/b2b/companyMember/:id' },
        updateCompanyMember: { url: urlPrefix + 'api/b2b/companyMember', method: 'POST' },
        deleteCompanyMember: { url: urlPrefix + 'api/b2b/companyMembers', method: 'DELETE' },

        invite: { url: urlPrefix + 'api/b2b/invite', method: 'POST' }
    });
}])

.factory('storefront.corporateRegisterApi', ['$resource', function ($resource) {
    var urlPrefix = 'http://localhost/admin/';
    //var urlPrefix = 'http://demovc-admin-dev.azurewebsites.net/';

    return $resource(urlPrefix + 'api/b2b/register', {}, {
        register: { url: urlPrefix + 'api/b2b/register', method: 'POST' },
        registerMember: { url: urlPrefix + 'api/b2b/registerMember', method: 'POST' },
        registerByInvite: { url: urlPrefix + 'api/b2b/register/:invite', method: 'POST' }
    });
}])