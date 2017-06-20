angular.module('storefront.account')
.factory('storefront.corporateAccountApi', ['$resource', function ($resource) {
    var urlPrefix = 'http://localhost/admin/';

    return $resource(urlPrefix + 'api/b2b/company', null, {
        getCompanyById: { url: urlPrefix + 'api/b2b/company/:id' },
        updateCompany: { url: urlPrefix + 'api/b2b/company', method: 'POST' },

        getCompanyMembers: { url: urlPrefix + 'api/b2b/companyMembers', method: 'POST' },
        getCompanyMember: { url: urlPrefix + 'api/b2b/companyMember/:id' },
        updateCompanyMember: { url: urlPrefix + 'api/b2b/companyMember', method: 'POST' }
    });
}])