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
    $ctrl.view = $location.search().view || 'grid';
    $ctrl.generatePageSizes = function (capacity, steps) {
        // for example            start: 16 stop: 16 * 3 + 1 = 49 step: 16
        $ctrl.pageSize = $location.search().page_size || capacity;
        $ctrl.pageSizes = _.range(capacity, capacity * steps + 1, capacity);
    }
    $ctrl.setSearchParam = function (name, value) {
        $location.search(name, value);
        location.reload();
    };
}]);
