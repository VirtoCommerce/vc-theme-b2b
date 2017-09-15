$(function () {
    // do not close dropdown when element inside it was clicked
    $(document).on('click.bs.dropdown.data-api', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });
    var mouseOverDropdownSelector = '[data-toggle="dropdown"]:not([data-toggle-trigger="click"])';
    // show dropdown when mouse enter to dropdown
    $(document).on('mouseenter.bs.dropdown.data-api', mouseOverDropdownSelector + ':not([aria-expanded="true"])', $.fn.dropdown.Constructor.prototype.toggle);
    $(document).on('mouseleave.bs.dropdown.data-api', '.dropdown', function (e) {
        var dropdownSelector = mouseOverDropdownSelector + ':not([aria-expanded="false"])';
        var nestedDropdownToggle = $(e.target).parents('.dropdown').find(dropdownSelector);
        var selfDropdownToggle = $(e.target).filter('.dropdown').find(dropdownSelector);
        var dropdownToggle = nestedDropdownToggle.add(selfDropdownToggle);
        if (dropdownToggle.length) {
            // hide dropdown menu when mouse leave dropdown or dropdown menu
            $.fn.dropdown.Constructor.prototype.toggle(e);
            // unfocus dropdown: itself or as parent of element fired event
            dropdownToggle.blur();
        }
    });
});
