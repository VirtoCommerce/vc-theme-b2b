angular.module('storefrontApp')
.component('vcFlyingPlaceholder', {
    templateUrl: "themes/assets/flying-placeholder.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        inputClass: '<',
        placeholder: '@'
    },
    controller: [function () {
        var $ctrl = this;
    }]
});
// .directive('vcFlyingPlaceholder', function() {
//     return {
//         controller: ['$scope', function vcFlyingInputController($scope) {
//             console.log($scope);
//           }],
//         templateUrl: 'themes/assets/flying-placeholder.tpl.html'
//     };
//   });
