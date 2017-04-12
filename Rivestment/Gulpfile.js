const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const minifyCSS = require('gulp-cssnano');
const concat = require('gulp-concat');
const del = require('del');

gulp.task('clean', function(){
  return del(['web/dist'])
})

gulp.task('sites', function(){
  return gulp.src('web/www/*.html')
    .pipe(gulp.dest('web/dist/www'));
})

gulp.task('images', function(){
  return gulp.src([
      'web/www/img/*.svg'
    ])
    .pipe(gulp.dest('web/dist/www/img'));
})

gulp.task('css', function(){
  return gulp.src([
      'web/www/css/*.css',
      'node_modules/metrics-graphics/dist/metricsgraphics.css',
      'node_modules/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(minifyCSS())
    .pipe(gulp.dest('web/dist/www/css'));
})

gulp.task('react', function(){
  return gulp.src([
      'web/www/js/*.jsx'])
    .pipe(babel({
      plugins: ['transform-react-jsx'],
      presets: ['es2015','stage-2']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('web/dist/www/js'));
})

gulp.task('scripts', function(){
  return gulp.src([
      'web/www/js/*.js',
      'node_modules/metrics-graphics/dist/metricsgraphics.js',
      'node_modules/d3/build/d3.js',
      'node_modules/markdown/lib/markdown.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/react/dist/react.js',
      'node_modules/react/dist/react.js',
      'node_modules/react-dom/dist/react-dom.js'])
    .pipe(uglify())
    .pipe(gulp.dest('web/dist/www/js'));
})

gulp.task('default',
  gulp.series(
    'clean',
    gulp.parallel('sites', 'images', 'css', 'react', 'scripts')
  )
)

//TODO: Can we just do this?
/*
gulp.task('bundle', function(){
  return gulp.src([
      'web/www/js/*.js',
      'node_modules/metrics-graphics/dist/metricsgraphics.js',
      'node_modules/d3/build/d3.js',
      'node_modules/markdown/lib/markdown.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/react/dist/react.js',
      'node_modules/react/dist/react.js',
      'node_modules/react-dom/dist/react-dom.js'])
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/www/js'));
})
*/
