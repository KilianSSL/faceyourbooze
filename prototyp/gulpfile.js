/* global require */
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const path = require('path');

/* Change your directory and settings here */
const settings = {
    publicDir: '.',
    sassDir: 'scss',
    cssDir: 'assets/css'
};

/**
 * serve task, will launch browserSync and launch index.html files,
 * and watch the changes for html and sass files.
 **/
gulp.task('serve', ['sass'], function() {

    /**
     * Launch BrowserSync from publicDir
     */
    browserSync.init({
        server: settings.publicDir
    });

    /**
     * watch for changes in sass files
     */
    gulp.watch(settings.sassDir + "/**/*.scss", ['sass']);

    /**
     * watch for changes in html files
     */
    gulp.watch(settings.publicDir + "/*.html").on('change', browserSync.reload);

});

/**
 * sass task, will compile the .SCSS files,
 * and handle the error through plumber and notify through system message.
 */
gulp.task('sass', function() {
    return gulp.src(settings.sassDir + "/**/*.scss")
        .pipe(sass().on('error', sass.logError))
        //.pipe(prefix('last 2 version'))
        .pipe(gulp.dest(settings.cssDir))
        .pipe(browserSync.stream());
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['serve']);