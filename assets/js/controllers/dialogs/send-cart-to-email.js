angular.module('storefrontApp')
    .controller('sendCartToEmailDialogController', ['$scope', '$uibModalInstance', 'accountApi', 'sortAscending', 'sortDescending', '$rootScope', function ($scope, $uibModalInstance, accountApi, sortAscending, sortDescending, $rootScope) {

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
            $scope.organizationMembers.sort((a, b) => {
                const first = a[$scope.sortInfos.sortBy];
                const second = b[$scope.sortInfos.sortBy];
                const shouldComeFirst = ($scope.sortInfos.sortDirection === sortAscending ? first < second : second < first);
                return shouldComeFirst === true ? -1 : 1;
            });
        }

        $scope.getSortDirection = function (fieldName) {
            return $scope.sortInfos.sortBy === fieldName ? $scope.sortInfos.sortDirection : '';
        }

        function invertSortDirection(sortDirection) {
            return sortDirection === sortAscending ? sortDescending : sortAscending;
        }

        accountApi.searchOrganizationUsers({
            skip: 0,
            take: 100
        }).then(function(result) {
                $scope.isLoading = false;
                $scope.organizationMembers.length = 0;
                $scope.organizationMembers.push(...result.data.results);

            },
            function() { $scope.isLoading = false; });

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

        $scope.send = function (email) {
            $scope.close();
            var ending = ` person${Object.values($scope.organizationMemberChecks).length !== 1 ? 's' : '' }`;
            $rootScope.$broadcast('successOperation', {
                type: 'success',
                message: 'The contents of the shopping cart was sent to ' + Object.values($scope.organizationMemberChecks).length + ending,
            });
        }

    }
]);
