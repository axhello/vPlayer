var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    fontmin = require('gulp-fontmin');
 
//压缩css
gulp.task('minifycss', function() {
    return gulp.src('src/css/*.css') //需要操作的文件
        .pipe(rename({ suffix: '.min' })) //rename压缩后的文件名
        .pipe(minifycss()) //执行压缩
        .pipe(gulp.dest('dist/css')); //输出文件夹
});
//压缩js  
gulp.task('scripts', function() {
    return gulp.src(['src/js/vue.min.js', 'src/js/vue-resource.min.js', 'src/js/vplayer.js'])
        .pipe(concat('app.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

//压缩图标字体
gulp.task('fontmin', function () {
    return gulp.src('src/fonts/*.ttf')
        .pipe(fontmin())
        .pipe(gulp.dest('dist/fonts'));
});

//gulp watch
gulp.task('watch', function () {  
   gulp.watch('src/css/*.css', ['minifycss']);  
   gulp.watch('src/js/*.js', ['scripts']);  
});
