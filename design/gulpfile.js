var autoprefixer, gulp, sass;

autoprefixer = require('gulp-autoprefixer');
gulp = require('gulp');
sass = require('gulp-sass');

// Task
gulp.task('sass', function () {
    return gulp.src('css/sass/main.sass')
        .pipe(sass())
        .pipe(autoprefixer({
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
        }))
        .pipe(gulp.dest('css'))
});

// Watch
gulp.task('watch', function () {
    gulp.watch('css/sass/*.sass', ['sass']);
})