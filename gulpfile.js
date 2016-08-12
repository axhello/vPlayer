var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('scripts',function(){
    return gulp.src(["script/vue.min.js","script/vue-resource.min.js","script/vplayer.js"])
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});