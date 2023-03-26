/**
 * Include gulp plugins
 */
const gulp = require('gulp');
const argv = require('yargs').argv;
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass')); 
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const csso = require('gulp-csso');
const rename = require("gulp-rename");
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const del = require('del');


/**
 * Include projectConfig file
 */
const projectConfig = require('./projectСonfig.json');

/**
 * Path settings
 */
const path = projectConfig.path;

path.watch = {};


/**
 * Css path
 */
path.src.style[0] = path.src.srcPath + path.src.style[0];

path.dist.style = path.dist.distPath + path.dist.style;

path.watch.style = [];
path.watch.style[0]  = path.src.style[0].replace( path.src.style[0].split('/').pop(), '**/*.scss' );

/**
 * Js path
 */
path.src.script[0] = path.src.srcPath + path.src.script[0];

path.dist.script = path.dist.distPath + path.dist.script;
 
path.watch.script = [];
path.watch.script[0] = path.src.script[0].replace( path.src.script[0].split('/').pop(), '**/*.js' );

/**
 * Images path
 */
path.src.image[0] = path.src.srcPath + path.src.image[0];
path.src.image[1] = "!" + path.src.image[0].slice(0, -6) + "svgIcons/*.svg";

path.dist.image = path.dist.distPath + path.dist.image;

path.watch.image = [];
path.watch.image[0] = path.src.image[0];
path.watch.image[1] = "!" + path.src.image[0].slice(0, -6) + "svgIcons/*.svg";

/**
 * Fonts path
 */
path.src.font[0] = path.src.srcPath + path.src.font[0];
path.src.font[1] = "!" + path.src.font[0].slice(0, -6) + "src/*.*";

path.dist.font = path.dist.distPath + path.dist.font;

path.watch.font = [];
path.watch.font[0] = path.src.font[0];
path.watch.font[1] = "!" + path.src.font[0].slice(0, -6) + "src/*.*";

/**
 * Dev check
 */
const isDev = function(){
    return !argv.prod;
}


/**
 * Prod check
 */
const isProd = function(){
    return !!argv.prod;
}

/**
 * Serve
 */ 
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		open: true, // Режим работы: true или false
        port: 8080
	})
   
}



/**
 * Style
 */ 
function scss(){
    return gulp.src(path.src.style)
        .pipe(gulpif(isDev(), sourcemaps.init()))
        .pipe(sass())
        .pipe(gulpif(isDev(), sourcemaps.write()))
        .pipe(gulpif(isProd(), gulp.dest(path.dist.style)))
        .pipe(gulpif(isProd(), csso()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.style))
		.pipe(browserSync.reload({stream: true}))
}

/**
 * Script
 */ 
const webpackConf = {
    mode: isDev() ? 'development' : 'production',
    devtool: isDev() ? 'eval-source-map' : false,
    optimization: {
        minimize: false
    },
    output: {
        filename: 'app.js',
    },
    module: {
        rules: []
    }
}

if(isProd()){
	webpackConf.module.rules.push({
		test: /\.(js)$/,
		exclude: /(node_modules)/,
		loader: 'babel-loader'
	});
}

function script(){
    return gulp.src(path.src.script)
        .pipe(plumber())
        .pipe(webpackStream(webpackConf, webpack))
        .pipe(gulpif(isProd(), gulp.dest(path.dist.script)))
        .pipe(gulpif(isProd(), uglify()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.script))
        .pipe(browserSync.reload({stream: true}))
}

/**
 * Image min
 */
function imageMin(){
    return gulp.src(path.src.image)
        .pipe(newer(path.dist.image))
        .pipe(imagemin([

            imagemin.svgo({
                plugins: [
                        { removeViewBox: false },
                        { removeUnusedNS: false },
                        { removeUselessStrokeAndFill: false },
                        { cleanupIDs: false },
                        { removeComments: true },
                        { removeEmptyAttrs: true },
                        { removeEmptyText: true },
                        { collapseGroups: true }
                ]
            })

        ]))
        .pipe(gulp.dest(path.dist.image))
}

/**
 * Webp
 */
function webConverter(){
    return gulp.src(path.dist.image + '**/*.{png,jpg,jpeg}')
		.pipe(webp())
		.pipe(gulp.dest(path.dist.image))
}

const image = gulp.series(imageMin, webConverter, (done) => {browserSync.reload(); done();});





/**
 * Fonts
 */
function font() {
    return gulp.src(path.src.font)		
        .pipe(gulp.dest(path.dist.font))
        .on('end', browserSync.reload);
};

/**
 * Clean
 */
 function clean(){
	return del([path.dist.distPath]);
}

/**
 * Watch
 */
function watch(){
    gulp.watch(path.watch.style, scss).on('change', browserSync.reload);
    gulp.watch(path.watch.script, script).on('change', browserSync.reload);
    gulp.watch(path.watch.image, image).on('change', browserSync.reload);
}

/**
 * Default task
 */
exports.default = gulp.series(
    gulp.parallel(clean),
    gulp.parallel(scss, script, image, font),
    gulp.parallel(browsersync, watch)
);