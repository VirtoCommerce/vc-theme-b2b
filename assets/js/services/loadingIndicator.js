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
