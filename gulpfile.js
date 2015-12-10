/*global -$ */
'use strict';
var fs = require('fs');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var nunjunksRender = require('gulp-nunjucks-render');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var packageJson = JSON.parse(fs.readFileSync('./package.json'));
var configJson = JSON.parse(fs.readFileSync('./config.json'));

var outputFileName = packageJson.name + '-' + packageJson.version + '.js';

gulp.task('layout', function() {
    nunjunksRender.nunjucks.configure(['docs']);

    return gulp.src(configJson.htmlFiles)
        .pipe(nunjunksRender({version: packageJson.version}))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('html', function() {
    nunjunksRender.nunjucks.configure(['docs'],  {watch: false});

    return gulp.src(configJson.htmlFiles)
        .pipe(nunjunksRender({version: packageJson.version}))
        .pipe($.useref())
        .pipe(gulp.dest(configJson.buildDir));
    //.pipe($.if('*.js', $.uglify()))
    //.pipe($.if('*.css', $.csso()))
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
});

gulp.task('serve', ['build', 'layout'], function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'dist', 'docs'],
            routes: {
                '/bower_components': 'bower_components',
                '/dist': 'dist'
            }
        }
    });

    // watch for changes
    gulp.watch([
        'docs/styles/**/*.css'
    ]).on('change', reload);

    gulp.watch('docs/**/*.html', ['layout']).on('change', reload);
    gulp.watch('src/**/*.js', ['scripts']).on('change', reload);
});

gulp.task('clean', function(callback) {
    require('del').bind(null, ['.tmp', 'dist', 'build']);
    callback();
});

gulp.task('build', function() {
    return gulp.src(configJson.srcFiles)
        .pipe($.concat(outputFileName))
        .pipe(gulp.dest(configJson.distDir))
        .pipe($.uglify())
        .pipe($.rename({extname: '.min.js'}))
        .pipe(gulp.dest(configJson.distDir));
});

gulp.task('copyBuild', ['build'], function() {
    return gulp.src(configJson.distDir + '**/*.js')
        .pipe($.copy(configJson.buildDir));
});

gulp.task('buildDocs', [
    'clean',
    'copyBuild',
    'html'
], function() {
});

gulp.task('deployDocs', ['buildDocs'], function() {
    var deploy = require('gulp-gh-pages');

    return gulp.src(configJson.buildDir + '**/*')
        .pipe(deploy());
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
