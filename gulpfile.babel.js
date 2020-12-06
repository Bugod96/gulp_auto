import gulp from "gulp";
import gulp_pug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import gulp_image from "gulp-image";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import browserify from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

sass.compiler = require("node-sass");

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
    // "src/*.pug": src 폴더에서 .pug로 끝나는 모든 파일들. 최상단의 파일들만.
    // "src/**/*.pug": src 내부의 폴더들 내부의 .pug 파일들까지 전부 포함.
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
    // img 파일의 모든 파일들 압축
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

export const pug_task = () =>
  gulp.src(routes.pug.src).pipe(gulp_pug()).pipe(gulp.dest(routes.pug.dest));
// .pug => .html로 컴파일.

export const clean = () => del(["build/", ".publish/"]);
// build 혹은 .publish 폴더가 존재하는 경우 삭제. 없으면 무시.

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));
// 개발 서버 구동.

const scss_task = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError)) // 에러 발생시 에러 출력. 만능은 아님.
    .pipe(
      autoprefixer() // 자동으로 package.json에 있는 "browserslist"의 호환성 설정 적용.
    )
    .pipe(miniCSS()) // css 파일의 공백 최소화. 하나의 줄로. 성능 최적화.
    .pipe(gulp.dest(routes.scss.dest));

const js_task = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      browserify({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }), // react 사용한 경우에는 react 관련 preset도 추가
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pug_task);
  gulp.watch(routes.img.src, img_task);
  gulp.watch(routes.scss.watch, scss_task);
  gulp.watch(routes.js.watch, js_task);
};

const img_task = () =>
  gulp.src(routes.img.src).pipe(gulp_image()).pipe(gulp.dest(routes.img.dest));

const prepare = gulp.series([clean, img_task]);
const assets = gulp.series([pug_task, scss_task, js_task]);
const devServer = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, devServer]);
export const deploy = gulp.series([build, ghDeploy, clean]);

// export const dev = gulp.series([build, postDevServer]);은 export const dev = () => gulp.series([build, postDevServer]);와 동일. development 단계에서 실행.

// import gulp from "gulp";는 최신 문법
// const gulp = require("gulp"); 위와 동일한 기능. 별도의 설정 없이 실행 가능한 js문법.
// gulpfile.js는 sexy한 최신 javascript 문법 이해불가.
// gulpfile.babel.js로 확장자 변경 + .babelrc 파일 생성: gulp를 babel을 이용하여 컴파일. 최신 js 문법 사용가능해짐.
