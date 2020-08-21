angular.module('storefrontApp')
    .controller('sendCartToEmailDialogController', ['$scope', '$uibModalInstance', 'accountApi', 'sortAscending', 'sortDescending', function ($scope, $uibModalInstance, accountApi, sortAscending, sortDescending) {

        $scope.isLoading = true;
        $scope.sortDescending = sortDescending;
        $scope.sortAscending = sortAscending;
        $scope.organizationMembers = [];
        $scope.organizationMemberChecks = {};
        $scope.allMembersSelected = {};

        $scope.sortInfos = {
            sortBy: 'name',
            sortDirection: sortDescending
        }

        $scope.sortChanged = function (sortBy) {
            $scope.sortInfos.sortDirection = ($scope.sortInfos.sortBy === sortBy) ?
                invertSortDirection($scope.sortInfos.sortDirection)
                : sortAscending;
            $scope.sortInfos.sortBy = sortBy;
            loadData();
        }

        $scope.getSortDirection = function (fieldName) {
            return $scope.sortInfos.sortBy === fieldName ? $scope.sortInfos.sortDirection : '';
        }

        function invertSortDirection(sortDirection) {
            return sortDirection == sortAscending ? sortDescending : sortAscending;
        }

        function loadData() {
            $scope.isLoading = true;
            return accountApi.searchOrganizationUsers({
                skip: 0,
                take: 100,
                sort: `${$scope.sortInfos.sortBy}:${$scope.sortInfos.sortDirection}`
            }).then(function(result) {
                    $scope.isLoading = false;
                    $scope.organizationMembers.length = 0;
                    $scope.organizationMembers.push(...result.data.results);
                },
                function() { $scope.isLoading = false; });
        }

        loadData();

        $scope.hasAnyOrganizationMemberCheck = function() {
            return Object.values($scope.organizationMemberChecks).includes(true);
        }

        $scope.hasAllOrganizationMemberChecked = function () {
            const organizationMemberChecks = Object.values($scope.organizationMemberChecks);
            return organizationMemberChecks.length && organizationMemberChecks.every(x => x === true);
        }

        $scope.toggleAllOrganizationMembers = function() {
            for (const member of $scope.organizationMembers) {
                $scope.organizationMemberChecks[member.id] = $scope.allMembersSelected;
            }
        };

        $scope.close = function(result) {
            if (result) {
                $uibModalInstance.close(result);
            } else {
                $uibModalInstance.dismiss('cancel');
            }
        }

    }
]);
