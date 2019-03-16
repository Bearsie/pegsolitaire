let gulp = require('gulp'),
    browserSync = require('browser-sync'),
    pump = require('pump');
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-jsmin'),
    imageMin = require('gulp-imagemin'),
    changed = require('gulp-changed'),
    htmlReaplce = require('gulp-html-replace'),
    htmlMin = require('gulp-htmlmin'),
    del = require('del');

const prodFolder = 'docs/',
      srcFolder = 'src/',
      scssInput = srcFolder + 'style/scss/*.scss',
      scssOutput = srcFolder + 'style/',
      cssInput = srcFolder + 'style/*.css',
      cssOutput = prodFolder + 'style/',
      es6Input = [ srcFolder + 'js/es6/localStorageService.js',
                   srcFolder + 'js/es6/currentPegBoardComposition.js',
                   srcFolder + 'js/es6/moveCounter.js',
                   srcFolder + 'js/es6/movesBackup.js',
                   srcFolder + 'js/es6/errorMessage.js',
                   srcFolder + 'js/es6/index.js'
                 ],
      es6Output = srcFolder + 'js/',
      jsInput = srcFolder + 'js/*.js',
      jsOutput = prodFolder + 'js/',
      imgInput = srcFolder + 'img/**/*.{jpg,jpeg,png,gif}',
      imgOutput = prodFolder + 'img/',
      htmlInput = srcFolder + '/*.html',
      srcMainInput = srcFolder + '/*.{html,js,json,xml,ico}',
      jsFilename = 'bundle.js',
      cssSource = 'style/style.css',
      filesToCopy = ['src/browserconfig.xml',
                     'src/favicon.ico',
                     'src/manifest.json'
                   ],
      jsSwInput = srcFolder + '*.js',
      prodFolderDel = prodFolder + "**/*.*",
      srcCompilationDel = [ srcFolder + 'js/*.js', srcFolder + 'style/*.css'];


gulp.task('default', function(callback){
  runSequence('watch',
              'cleanSrcCompiledFiles',
              ['compileSassToCss', 'bundleJSfiles'],
              callback);
});


gulp.task('build', function(callback){
  runSequence( 'cleanSrcCompiledFiles',
              ['compileSassToCss', 'bundleJSfiles'],
              'cleanProdFolder',
              [ 'compressImages',
                'copyFiles',
                'cleanHtml',
                'cleanCss',
                'uglifyJS',
                'uglifyJSserviceWorkers'
              ],
              callback);
});


gulp.task('clean', ['cleanProdFolder', 'cleanSrcCompiledFiles']);

gulp.task('cleanProdFolder', function() {
  return del(prodFolderDel);
});

gulp.task('cleanSrcCompiledFiles', function() {
  return del(srcCompilationDel);
});



gulp.task('runLocalServer', function() {
  browserSync({
    server: srcFolder
  });
});

gulp.task('compileSassToCss', function(callback) {
  pump([
      gulp.src(scssInput),
      sourcemaps.init(),
      sass(),
      autoprefixer({
        browsers: ['last 3 versions']
      }),
      sourcemaps.write(),
      browserSync.stream(),
      gulp.dest(scssOutput)
    ],
    callback
  );
});

gulp.task('bundleJSfiles', function(callback) {
  pump([
      gulp.src(es6Input),
      sourcemaps.init(),
      concat(jsFilename),
      sourcemaps.write(),
      gulp.dest(es6Output)
    ],
    callback
  );
});

gulp.task('watch', ['runLocalServer'], function() {
  gulp.watch(scssInput, ['compileSassToCss']);
  gulp.watch(es6Input, ['bundleJSfiles', 'reloadBrowsers']);
  gulp.watch(imgInput, ['reloadBrowsers']);
  gulp.watch(srcMainInput, ['reloadBrowsers']);
});

gulp.task('reloadBrowsers', function() {
  browserSync.reload();
});



gulp.task('compressImages', function(callback) {
  pump([
      gulp.src(imgInput),
      changed(imgOutput),
      imageMin(),
      gulp.dest(imgOutput)
    ],
    callback
  );
});


gulp.task('copyFiles', function(){
  return gulp.src(filesToCopy)
      .pipe(gulp.dest(prodFolder));
});

gulp.task('cleanHtml', function(callback) {
  pump([
      gulp.src(htmlInput),
      htmlReaplce({
        'css': cssSource
      }),
      htmlMin({
        sortAttributes: true,
        sortClassName: true,
        //collapseWhitespace: true
      }),
      gulp.dest(prodFolder)
    ],
    callback
  );
});

gulp.task('cleanCss', function(callback) {
  pump([
      gulp.src(cssInput),
      cleanCSS(),
      gulp.dest(cssOutput)
    ],
    callback
  );
});

gulp.task('uglifyJS', function(callback) {
  pump([
      gulp.src(jsInput),
      uglify(),
      gulp.dest(jsOutput)
    ],
    callback
  );
});

gulp.task('uglifyJSserviceWorkers', function(callback) {
  pump([
      gulp.src(jsSwInput),
      uglify(),
      gulp.dest(prodFolder)
    ],
    callback
  );
});
