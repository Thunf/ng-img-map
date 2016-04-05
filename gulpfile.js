var gulp = require("gulp"), 
    $ = {};

$.less      = require("gulp-less"),
$.concat    = require("gulp-concat"),
$.rename    = require("gulp-rename"),
$.uglify    = require("gulp-uglify"),
$.jshint    = require("gulp-jshint"),
$.prefixer  = require("gulp-autoprefixer"),
$.cssminify = require("gulp-minify-css");

var config = {
    name: 'ng-img-map',
    source: 'source/**/*',
    compile: 'compile'
}

// css concat/minify
gulp.task('css', function() {
    return gulp.src(config.source + '.less')
        .pipe($.less())
        .pipe($.concat(config.name + '.css'))
        .pipe($.prefixer({
            browsers: ['> 1%'],
            cascade: false
        }))
        .pipe(gulp.dest(config.compile))
        .pipe($.cssminify())
        .pipe($.rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(config.compile));
});


// js hint
gulp.task('js:hint',function(){
    return gulp.src(config.source + '.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
});

// js concat/uglify/minify
gulp.task('js', function(){
    return gulp.src(config.source + '.js')
        // .pipe(gulp.dest(config.tPath.js))
        .pipe($.uglify())
        .pipe($.rename({
            suffix: '.min',
            extname: '.js'
        }))
        .pipe(gulp.dest(config.compile));
});

// default
gulp.task('default', ['css', 'js'], function(){
    console.log("compile files");
});

