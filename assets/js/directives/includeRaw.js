var storefrontApp = angular.module('storefrontApp');

// based on https://github.com/angular/angular.js/blob/master/src/ng/directive/ngInclude.js
storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('ngIncludeDirective', ['$delegate', function ($delegate) {
        var includeFillContentDirective = $delegate[1];
        var link = includeFillContentDirective.link;
        includeFillContentDirective.link = function (scope, $element, $attr, ctrl) {
            if (!Object.keys($attr).includes('raw')) {
                link(scope, $element, $attr, ctrl);
            } else {
                $element.text(ctrl.template);
            }
        };
        includeFillContentDirective.compile = function () {
            return includeFillContentDirective.link;
        };
        $delegate[1] = includeFillContentDirective;
        return $delegate;
    }]);
}]);
