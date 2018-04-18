var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('collectionController', ['$scope', '$location', function ($scope, $location) {
    $scope.fulfillmentCenters = [];
    $scope.currentfulfillmentCenter = null;
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
        $ctrl.keywordQuery = { keyword: [], branch:[] };
        $ctrl.currentBranch = null;
        $ctrl.searchInBranch = null;
        
    }
    
    $ctrl.generatePageSizes = function (capacity, steps) {
        $ctrl.pageSizeQuery = { page_size: [capacity] };
        // for example            start: 16 stop: 16 * 3 + 1 = 49 step: 16
        $ctrl.pageSizes = _.range(capacity, capacity * steps + 1, capacity);
    }
    
    
    $ctrl.selectedBranch = function() {
        var sc = $scope;
        if ($ctrl.searchInBranch) {
            $ctrl.keywordQuery.branch = null;
        }
        else {
            $ctrl.keywordQuery.branch = [$scope.getCurrentFulfillment()];
        }
    }

    $scope.getCurrentFulfillment = function() {
        var result = _.find($scope.fulfillmentCenters, function(fulfillment){ return fulfillment.selected === true; });
        return result.name;
    };

    $scope.$on('$locationChangeSuccess', function(event) {
        $ctrl.searchInBranch = angular.isDefined($ctrl.keywordQuery.branch[0]);
    });

    $ctrl.init();
}]);
