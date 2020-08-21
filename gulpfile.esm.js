import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';
import { dest, parallel, series, src, watch } from 'gulp';
import babel from 'gulp-babel';
import bootlint from 'gulp-bootlint';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import gitignore from 'gulp-exclude-gitignore';
import htmlmin from 'gulp-htmlmin';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import zip from 'gulp-zip';
import merge from "merge2";
import bundleConfig from './bundleconfig.json';
import packageJson from './package.json';

const regex = {
    scss: /^.*\.scss\.css$/,
    css: /^(?!.*\.scss\.css).*\.css$/,
    html: /^.*\.(html|htm)$/,
    liquid: /^.*\.liquid$/,
    js: /^.*\.js$/,
    ext: /\.([^\.\/]+)$/
};

function getBundles(regexPattern) {
    return bundleConfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

function getDirectories() {
    return bundleConfig.filter(function (bundle) {
        return !regex.ext.test(bundle.outputFileName);
    });
}

function mapSources(isDynamic) {
    return sourcemaps.mapSources(
        function (sourcePath, file) {
            // ../../../ for assets[/static]/bundle
            const relativeRootPath = '../'.repeat(!isDynamic ? 3 : 2) + sourcePath;
            return relativeRootPath;
        }
    );
}

const minJs = () => {
    const tasks = getBundles(regex.js).map(function(bundle) {
        return src(bundle.inputFiles, { base: '.', allowEmpty: true })
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat(bundle.outputFileName))
            .pipe(babel({
                presets: [
                    [
                        '@babel/env',
                        {
                            modules: false
                        }
                    ]
                ]
            }))
            .pipe(terser({
                keep_fnames: true
            }))
            .pipe(mapSources())
            .pipe(sourcemaps.write("."))
            .pipe(dest('.'));
    });
    return merge(tasks);
};
exports['min:js'] = minJs;

const minScss = () => {
    const tasks = getBundles(regex.scss).map(function(bundle) {
        return src(bundle.inputFiles, { base: '.', allowEmpty: true })
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sass({
                outputStyle: "nested",
                precision: 10
            }))
            .pipe(concat(bundle.outputFileName))
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(mapSources())
            .pipe(sourcemaps.write("."))
            .pipe(dest('.'));
    });
    return merge(tasks);
};
exports['min:scss'] = minScss;

const minCss = () => {
    const tasks = getBundles(regex.css).map(function (bundle) {
        return src(bundle.inputFiles, { base: '.', allowEmpty: true })
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat(bundle.outputFileName))
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(mapSources())
            .pipe(sourcemaps.write("."))
            .pipe(dest('.'));
    });
    return merge(tasks);
};
exports['min:css'] = minCss;

const minHtml = () => {
    const tasks = getBundles(regex.html).map(function (bundle) {
        return src(bundle.inputFiles, { base: '.', allowEmpty: true })
            .pipe(concat(bundle.outputFileName))
            .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true }))
            .pipe(dest('.'));
    });
    return merge(tasks);
};
exports['min:html'] = minHtml;

export const min = parallel(minJs, series(minScss, minCss), minHtml);

export const copy = () => {
    const tasks = getDirectories().map(function (item) {
        return src(item.inputFiles)
            .pipe(dest(item.outputFileName));
    });
    return merge(tasks);
};

export const clean = () => {
    const files = [].concat(...bundleConfig.map(function (bundle) {
        const fileName = bundle.outputFileName;
        return [fileName, fileName.replace(regex.ext, '.$1.map')];
    }));

    return del(files);
};

const defaultTasks = [min, copy];

const watchTask = () => {
    watch('./bundleconfig.json', series(defaultTasks));

    getBundles(regex.js).forEach(function (bundle) {
        watch(bundle.inputFiles, series(eslintTask, minJs));
    });

    getBundles(regex.scss).forEach(function (bundle) {
        watch(bundle.inputFiles, series(minScss));
    });

    getBundles(regex.css).forEach(function (bundle) {
        watch(bundle.inputFiles, series(minCss));
    });

    getBundles(regex.html).forEach(function (bundle) {
        watch(bundle.inputFiles, series(bootlintTask, minHtml));
    });

    getBundles(regex.liquid).forEach(function (bundle) {
        watch(bundle.inputFiles, series(bootlintTask));
    });

    getDirectories().map(function(item) {
        watch(item.inputFiles, series(copy));
    });
};
exports['watch'] = watchTask;

export const bootlintTask = () => {
    return src(['./**/*.html', './**/*.liquid', '!./design/**/*.*'])
        .pipe(gitignore())
        .pipe(bootlint({
            disabledIds: ['E001', 'W001', 'W002', 'W003', 'W005']
        }));
};
exports['bootlintTask'] = bootlintTask;

export const eslintTask = () => {
    const tasks = getBundles(regex.js).filter(function(bundle) { return !bundle.disableLint || bundle.disableLint === undefined }).map(function(bundle) {
        return src(bundle.inputFiles, { base: '.', allowEmpty: true })
            .pipe(eslint("./.eslintrc.json"))
            .pipe(eslint.format());
    });
    return merge(tasks);
};
exports['eslint'] = eslintTask;

export const lint = series(bootlintTask, eslintTask);

export const compress = series(min, function() {
    return merge(
            src([
                './*/**', ...bundleConfig.map(function(bundle) {
                    return bundle.inputFiles.map(function(inputFile) { return '!' + inputFile; });
                }).reduce((acc, val) => acc.concat(val), [])
            ])
            .pipe(gitignore()),
            // Need to add them manually because otherwise all bundles will be skipped as they are in .gitignore
            src("assets/static/bundle/**", { base: '.', allowEmpty: true })
        )
        .pipe(rename(function(path) {
            path.dirname = 'default/' + path.dirname;
        }))
        .pipe(zip(packageJson.name + '-' + packageJson.version + '.zip'))
        .pipe(dest('artifacts'));
});

export default series(lint, defaultTasks);
