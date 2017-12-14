(function () {
    window.Toc.helpers.findOrFilter = function($el, selector) {
        var $descendants = $el.find(selector);
        return $el.filter(selector).add($descendants).filter(':not([data-toc-skip])').filter(function () {
            return !$(this).parents("[data-toc-skip]").length;
        });
    };

    // from https://github.com/afeld/bootstrap-toc/pull/37
    window.Toc.helpers.generateEmptyNavEl = function() {
        var $li = $('<li></li>');
        return $li;
    };

    window.Toc.helpers.getHeadings = function($scope, depth, topLevel) {
        var selector = '';
        for (var i = topLevel; i < topLevel + depth; i++) {
            selector += 'h' + i;
            if (i < topLevel + depth - 1)
                selector += ',';
        }
        return this.findOrFilter($scope, selector);
    };

    window.Toc.helpers.populateNav = function($topContext, depth, topLevel, $headings) {
        var $contexts = new Array(depth);
        var helpers = this;

        $contexts[0] = $topContext;
        $topContext.lastNav = null;

        $headings.each(function(i, el) {
            var $newNav = helpers.generateNavItem(el);
            var navLevel = helpers.getNavLevel(el);
            var relLevel = navLevel - topLevel;
            var j;

            for (j = relLevel + 1; j < $contexts.length; j++) {
                $contexts[j] = null;
            }

            if (!$contexts[relLevel]) {
                for (j = 0; j < relLevel; j++) {
                    if (!$contexts[j + 1]) {
                        if (!$contexts[j].lastNav) {
                            var $emptyNav = helpers.generateEmptyNavEl();
                            $contexts[j].append($emptyNav);
                            $contexts[j].lastNav = $emptyNav;
                        }
                        $contexts[j + 1] = helpers.createChildNavList($contexts[j].lastNav);
                        $contexts[j + 1].lastNav = null;
                    }
                }
            }

            $contexts[relLevel].append($newNav);
            $contexts[relLevel].lastNav = $newNav;
        });
    };

    window.Toc.helpers.parseOps = function(arg) {
        var opts;
        if (arg.jquery) {
            opts = {
                $nav: arg
            };
        } else {
            opts = arg;
        }
        opts.$scope = opts.$scope || $(document.body);
        opts.depth = opts.depth || opts.$nav.attr('data-toc-depth') || 2;
        return opts;
    };

    window.Toc.init = function(opts) {
        opts = this.helpers.parseOps(opts);

        // ensure that the data attribute is in place for styling
        opts.$nav.attr('data-toggle', 'toc');

        var $topContext = this.helpers.createChildNavList(opts.$nav);
        var topLevel = this.helpers.getTopLevel(opts.$scope);
        var $headings = this.helpers.getHeadings(opts.$scope, opts.depth, topLevel);
        this.helpers.populateNav($topContext, opts.depth, topLevel, $headings);
    };
})();
