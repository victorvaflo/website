const { series, dest, src, task, parallel, watch } = require('gulp');
const gulpEsbuild = require('gulp-esbuild');
const pug = require('gulp-pug');
const rev = require('gulp-rev');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const revRewrite = require('gulp-rev-rewrite');
const del = require('del');
const revDel = require('rev-del');
const replace = require('gulp-replace');

sass.compiler = require('node-sass');

const sources = {
  html: 'src/*.pug',
  scripts: ['src/assets/scripts/{app,claim,communities,create,home,member}.ts', 'src/assets/scripts/opportunity/jobboard.ts'],
  images: 'src/**/*.{png,svg,jpg,jpeg,gif}',
  styles: 'src/**/*.scss',
  revision: 'dist/**/*.{css,js,svg,png,gif,jpeg,jpg}'
}

task('clean', (done) => {
    del.sync(['dist/**', '.rev/**']);
    done();
});

task('html', (done) => {
  src(sources.html)
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest('dist'));

  done();
});

task('scripts', (done) => {
  src(sources.scripts)
    .pipe(gulpEsbuild({
      platform: 'browser',
      bundle: true
    }))
    .pipe(replace('@APP_VERSION', '@' + process.env.npm_package_version))
    .pipe(dest('dist/assets/scripts'));

  done();
});

task('images', (done) => {
  src(sources.images)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false}
        ]
      })
    ]))
    .pipe(dest('dist'));

  done();
});

task('styles', function (done) {
  src(sources.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist'));

  done();
});

task('revision', (done) => {
  src(sources.revision)
    .pipe(rev())
    .pipe(revDel())
    .pipe(src('dist/**/*.html'))
    .pipe(revRewrite())
    .pipe(dest('dist'));

  done();
});

// Build
task('build', series('clean', parallel('html', 'scripts', 'images', 'styles')));
task('buildServer', (done) => {

});

// Dev
task('watch', series('build', () => {
  watch(sources.html, series('html', 'revision'));
  watch(sources.scripts, series('scripts', 'revision'));
  watch(sources.images, series('images', 'revision'));
  watch(sources.styles, series('styles', 'revision'));
}))