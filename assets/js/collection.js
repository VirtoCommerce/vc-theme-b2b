var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('collectionController', ['$scope', '$location',  function ($scope, $location) {
    $scope.currentFulfillmentCenter = { id: null };
    var $ctrl = this;
    $ctrl.init = function() {
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
        $ctrl.keywordQuery = { keyword: [] };       
    }
    
    $ctrl.generatePageSizes = function (capacity, steps) {
        $ctrl.pageSizeQuery = { page_size: [capacity] };
        // for example            start: 16 stop: 16 * 3 + 1 = 49 step: 16
        $ctrl.pageSizes = _.range(capacity, capacity * steps + 1, capacity);
    }

  
    $ctrl.init();
}]);
