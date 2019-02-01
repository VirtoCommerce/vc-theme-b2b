var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcContentPlace', ['$compile', 'marketingService', function ($compile, marketingService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            marketingService.getDynamicContent(attrs.id).then(function (response) {
                element.html($compile(response.data)(scope));
            });
        },
        replace: true
    }
}]);

storefrontApp.directive('vcEnterSource', ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        controller: function() { },
        link: function (scope, element, attrs, ctrl) {
            var onKeyPress = function (event) {
                if (event.keyCode === 13) { // Enter
                    ctrl.element[0].click();
                }
            };
            element.on('keypress', onKeyPress);
            scope.$on('$destroy', function () {
                element.off('keypress', onKeyPress);
            });
        }
    };
}]);

storefrontApp.directive('vcEnterTarget', [function () {
    return {
        restrict: "A",
        require: "^vcEnterSource",
        link: function (scope, element, attrs, ctrl) {
            ctrl.element = element;
        }
    };
}]);

storefrontApp.directive('fallbackSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('error', errorHandler);

            scope.$on('$destroy', function() {
                element.off('error', errorHandler);
            });

            function errorHandler(event) {
                if (element.attr('src') !== attrs.fallbackSrc) {
                    element.attr('src', attrs.fallbackSrc);
                }
                else {
                    element.off(event);
                }
            };
        }
    }
});
// var INTEGER_REGEXP = /^-?\d+$/;
var QUANTITY_REGEXP = /^\d+$/;
// var NUMBER_REGEXP = /^-?\d{1,}([\.\,]\d{0,})?$/;
var PRICE_REGEXP = /^\d{1,}([\.\,]\d{0,})?$/;
var EMAIL_REGEXP = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;

storefrontApp.directive('contentType', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ctrl) {
            var data = attrs.contentType;
            function isDigit(code) {
                return (code > '47') && (code < '58') || (code > '95') && (code < '106');
            }
            function isDecimalSeparator(code) {
                return (code == '188') || (code == '189') || (code == '110');
            }
            function isNavigationArrow(code) {
                return (code > '34') && (code < '41');
            }
            function isControll(code) {
                return (code == '8') || (code == '17') || (code == '45') || (code == '46');
            }
            function isCopyPaste(code, ctrlDown) {
                return (ctrlDown && code=='67') || (ctrlDown && code=='86') || (ctrlDown && code=='88');
            }
            if(ctrl){
                switch (data.toLowerCase()) {
                    case 'email': {
                        ctrl.$validators.email = function(modelValue) {
                            return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                        };
                        break;
                    }
                    case 'price': {
                        element.on('keydown', function(event){
                            var e = event || $window.event, code = e.keyCode,
                                ctrlDown = e.ctrlKey||e.metaKey;
                            if( !(isDigit(code) || isDecimalSeparator(code) ||
                                  isNavigationArrow(code) || isControll(code) || isCopyPaste(code, ctrlDown)) ){
                                event.preventDefault();
                            }
                        });

                        ctrl.$validators.price = function(modelValue) {
                            return ctrl.$isEmpty(modelValue) || PRICE_REGEXP.test(modelValue);
                        };
                        break;
                    }
                    case 'quantity': {
                        element.on('keydown', function(event){
                            var e = event || $window.event, code = e.keyCode,
                                ctrlDown = e.ctrlKey||e.metaKey;
                            if( !(isDigit(code) || isNavigationArrow(code) || isControll(code) || isCopyPaste(code, ctrlDown))){
                                event.preventDefault();
                            }
                        });
                        ctrl.$validators.price = function(modelValue) {
                            return ctrl.$isEmpty(modelValue) || QUANTITY_REGEXP.test(modelValue);
                        };
                        break;
                    }
                }
            }
        }
    }
});
