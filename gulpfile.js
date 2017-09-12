/// <binding BeforeBuild='default' Clean='clean' ProjectOpened='watch' />

var gulp = require('gulp'),
    
    filter = require('gulp-filter'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    del = require('del'),

    mergestream = require('merge-stream'),
    sequence = require('run-sequence'),
    resolve = require('resolve'),
    util = require('gulp-util'), // preserve to be able output custom messages in future

    mainbowerfiles = require('main-bower-files'),
    uglify = require('gulp-uglify'),
    bourbon = require('node-bourbon'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    cssimport = require('postcss-import'),
    partialsimport = require('postcss-partial-import'),
    scss = require('postcss-scss'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-image'),
    sourcemaps = require('gulp-sourcemaps'),

    eslint = require('gulp-eslint'),
        
    zip = require('gulp-zip'),
    gitignore = require('gulp-exclude-gitignore');

var regex = {
    scss: /^.*\.scss\.css$/,
    css: /^(?!.*\.scss\.css).*\.css$/,
    html: /^.*\.(html|htm)$/,
    js: /^.*\.js$/,
    ext: /\.([^\.\/]+)$/
};

function getPackage() {
    delete require.cache[require.resolve('./package.json')];
    return require('./package.json');
}

function getBundleConfig() {
    delete require.cache[require.resolve('./bundleconfig.json')];
    return require('./bundleconfig.json');
}

function merge(streams) {
    return streams.length ? mergestream(streams) : mergestream().end();
}

gulp.task('min', ['min:js', 'min:scss', 'min:css', 'min:html']);

function mapSources(isDynamic) {
    return sourcemaps.mapSources(
        function (sourcePath, file) {
            // ../../../ for assets[/static]/bundle
            var relativeRootPath = '../'.repeat(!isDynamic ? 3 : 2) + sourcePath;
            return relativeRootPath;
        }
    );
}

gulp.task('min:js', function () {
    var tasks = getBundles(regex.js).map(function (bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(sourcemaps.init())
            .pipe(concat(bundle.outputFileName))
            .pipe(uglify({ mangle: false }))
            .pipe(mapSources())
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

function autoprefix() {
    return autoprefixer({
        browsers: [
            'Explorer >= 10',
            'Edge >= 12',
            'Firefox >= 19',
            'Chrome >= 20',
            'Safari >= 8',
            'Opera >= 15',
            'iOS >= 8',
            'Android >= 4.4',
            'ExplorerMobile >= 10',
            'last 2 versions'
        ]
    });
}

gulp.task('min:scss', function () {
    var tasks = getBundles(regex.scss).map(function(bundle) {
            return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(sourcemaps.init())
            //.pipe(postcss([
            //    partialsimport({
            //        path: bundle.inputFiles.map(function(inputFile) {
            //            return inputFile.substr(0, inputFile.lastIndexOf('/'));
            //        }),
            //        prefix: "_",
            //        extension: ".scss",
            //        glob: false
            //    }),
            //    autoprefix()
            //], { syntax: scss }))
            .pipe(sass({
                outputStyle: "compressed",
                precision: 5
            }))
            .pipe(concat(bundle.outputFileName))
            .pipe(postcss([autoprefix()]))
            //.pipe(rename({ extname: '.css' }))
            .pipe(mapSources(true))
            .pipe(sourcemaps.write("."))
            //.pipe(rename(function (path) {
            //    if (path.extname === '.css') {
            //        path.extname = '.scss';
            //    }
            //}))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('min:css', function () {
    var tasks = getBundles(regex.css).map(function (bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(sourcemaps.init())
            .pipe(concat(bundle.outputFileName))
            .pipe(postcss([autoprefix(), cssnano()]))
            .pipe(mapSources())
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('min:html', function () {
    var tasks = getBundles(regex.html).map(function (bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(concat(bundle.outputFileName))
            .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true }))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('copy', function() {
    var tasks = getDirectories().map(function (item) {
        return gulp.src(item.inputFiles)
            .pipe(gulp.dest(item.outputFileName));
    });
    return merge(tasks);
});

gulp.task('clean', function () {
    var files = [].concat.apply([], getBundleConfig().map(function (bundle) {
        var fileName = bundle.outputFileName;
        return [fileName, fileName.replace(regex.ext, '.$1.map')];
    }));

    return del(files);
});

gulp.task('watch', function () {
    gulp.watch('./bundleconfig.json', ['min']);

    getBundles(regex.js).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:js']);
    });

    getBundles(regex.scss).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:scss']);
    });

    getBundles(regex.css).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:css']);
    });

    getBundles(regex.html).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:html']);
    });

    getDirectories().map(function(item) {
        gulp.watch(item.inputFiles, ['copy']);
    });
});

function getBundles(regexPattern) {
    return getBundleConfig().filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

function getDirectories() {
    return getBundleConfig().filter(function (bundle) {
         return !regex.ext.test(bundle.outputFileName);
    });
}

gulp.task('lint', function () {
    var tasks = getBundles(regex.js).filter(function(bundle) { return !bundle.disableLint || bundle.disableLint === undefined }).map(function(bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(eslint("./.eslintrc.json"))
            .pipe(eslint.format());
    });
    return merge(tasks);
});

gulp.task('compress', ['min'], function() {
    var package = getPackage();
    return gulp.src([].concat(['./*/**'], [].concat.apply([], getBundleConfig().map(function(bundle) {
            return bundle.inputFiles.map(function(inputFile) { return '!' + inputFile; })
    }))))
        .pipe(gitignore())
        .pipe(rename(function(path) {
            path.dirname = 'default/' + path.dirname;
        }))
        .pipe(zip(package.name + '-' + package.version + '.zip'))
        .pipe(gulp.dest('artifacts'));
});

// DEFAULT Tasks
gulp.task('default', function(callback) {
    sequence('lint', ['min', 'copy'], callback);
});
