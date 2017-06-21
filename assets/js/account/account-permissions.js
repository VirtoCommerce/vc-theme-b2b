angular.module('storefront.account')
.component('vcAccountPermissions', {
    templateUrl: "themes/assets/js/account/account-permissions.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['authService', 'loadingIndicatorService', function (authService, loader) {
        var ctrl = this;
        ctrl.loader = loader;

        // Temporary mock
        var roles = [
            {
                "name": "B2B Company",
                "permissions": [],
                "id": "12dc3bacf2a34c8d9f72dea5468f1f5a"
            },
            {
                "name": "Clothing accessory category manager",
                "description": "Working with only accestory category of Clothing catalog",
                "permissions": [],
                "id": "87105cd4bcf940adad11a7b83fe2913c"
            },
            {
                "name": "Clothing order supervisor",
                "description": "Supervise all orders from Clothing store",
                "permissions": [],
                "id": "50a966a5040d4166852f4827cf892e83"
            },
            {
                "name": "Electronic  store administrator",
                "description": "Working only with electronic store. catalogs,  orders and cms",
                "permissions": [],
                "id": "21e43f94805e4315ad877de0a19a9263"
            },
            {
                "name": "Order manager",
                "description": "Worked with only with self assigned orders",
                "permissions": [],
                "id": "c6bd04db2f3744bb83c245c84375fc66"
            },
            {
                "name": "Use api",
                "description": "This role allow to use web api",
                "permissions": [],
                "id": "e75700bb597948cca7962e0bbcfdb97c"
            }
        ];
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 10, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            var start = (ctrl.pageSettings.currentPage - 1) * ctrl.pageSettings.itemsPerPageCount;
            var end = start + ctrl.pageSettings.itemsPerPageCount;
            ctrl.roles = roles.slice(start, end);
            ctrl.pageSettings.totalItems = roles.length;
        };

        ctrl.hasRole = function(role) {
            return _.some(authService.roles, function(currentRole) {
                return currentRole.id === role.id;
            });
        }

        this.$routerOnActivate = function (next) {
            ctrl.pageSettings.currentPage = next.params.pageNumber || ctrl.pageSettings.currentPage;
            ctrl.pageSettings.pageChanged();
        };
    }]
});
