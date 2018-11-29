const gulp = require('gulp');
const uglify = require('gulp-uglify');
const minifycss = require('gulp-minify-css');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin'); //html压缩
const processhtml = require('gulp-processhtml');
const Replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant'); //图片深入压缩
const imageminOptipng = require('imagemin-optipng');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminJpegtran = require('imagemin-jpegtran');
const cache = require('gulp-cache');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pump = require('pump');
const fs = require('fs');

const config = require('./config.json')

var Browsers = config.cssBrowsers;
var date = new Date().getTime();

function errrHandler(e) {
    // 控制台发声,错误时beep一下
    gutil.beep();
    gutil.log(e);
    this.emit('end');
}

function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { 
                deleteall(curPath);
            } else { 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function setDir(v) {
    return config.path + v.replace(/\.\//, '/')
}

gulp.task('htmlmin', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    config.html.map((v) => {
        gulp.src(`${v}/*.html`)
            .pipe(plumber({ errorHandler: errrHandler }))
            .pipe(Replace(/src\=\"*.+\.js\"*|ref\=\"*.+\.css\"*/gi, function(match, p1, offset, string) {
                const hasMin = match.indexOf('min') >= 0;
                match = match.replace(/\.js/, '.js?' + date).replace(/\.css/, '.css?' + date);
                return !hasMin ? match.replace(/\.js/, '.min.js').replace(/\.css/, '.min.css') : match;
            }))
            .pipe(processhtml())
            .pipe(htmlmin(options))
            .pipe(gulp.dest(setDir(v)));
    });
});

gulp.task('compressjs', function() {
    config.js.map((v) => {
        const path = setDir(v);
        gulp.src(`${v}/!(*.min).js`)
            .pipe(babel())
            .pipe(rename({ suffix: '.min' }))
            .pipe(uglify())
            .pipe(gulp.dest(path));
        gulp.src(`${v}/*.min.js`)
            .pipe(gulp.dest(path));
    });
});

gulp.task('compresscss', function() {
    config.css.map((v) => {
        const path = setDir(v);
        gulp.src(`${v}/!(*.min).css`)
            .pipe(postcss([autoprefixer({
                browsers: Browsers,
                cascade: true
            })]))
            .pipe(rename({ suffix: '.min' }))
            .pipe(minifycss())
            .pipe(gulp.dest(path))
        gulp.src(`${v}/*.min.css`)
            .pipe(gulp.dest(path));
    });
});

gulp.task('imagemin', function() {
    config.image.map((v) => {
        gulp.src(`${v}/*`)
            .pipe(cache(imagemin({
                progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片          
                svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
                use: [pngquant(), imageminJpegtran({ progressive: true }), imageminGifsicle({ interlaced: true }), imageminOptipng({ optimizationLevel: 3 }), imageminSvgo()] //使用pngquant深度压缩png图片的imagemin插件          
            })))
            .pipe(gulp.dest(setDir(v)));
    })
});

gulp.task('scp', function() {
    config.scp.map((v) => {
        gulp.src(`${v}/*`)
            .pipe(gulp.dest(setDir(v)));
    });
});

gulp.task('clean', function(cb) {
    if (!fs.existsSync(config.path)) {
        fs.mkdir(config.path, function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("目录创建成功。");
        });
    } else {
        deleteall(config.path)
    }
});

gulp.task('default', function() {
    gulp.start('clean', 'compressjs', 'compresscss', 'htmlmin', 'imagemin', 'scp');

})