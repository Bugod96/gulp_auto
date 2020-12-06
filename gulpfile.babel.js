import gulp from "gulp";
import gulp_pug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
    // "src/*.pug": src 폴더에서 .pug로 끝나는 모든 파일들. 최상단의 파일들만.
    // "src/**/*.pug": src 내부의 폴더들 내부의 .pug 파일들까지 전부 포함.
  },
};

export const pug_task = () =>
  gulp.src(routes.pug.src).pipe(gulp_pug()).pipe(gulp.dest(routes.pug.dest));
// .pug => .html로 컴파일.

export const clean = () => del(["build/"]);
// build 폴더가 존재하는 경우 삭제. 없으면 무시.

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));
// 개발 서버 구동.

const watch = () => {
  gulp.watch(routes.pug.watch, pug_task);
};

const prepare = gulp.series([clean]);
const assets = gulp.series([pug_task]);
const postDevServer = gulp.parallel([webserver, watch]);

export const dev = gulp.series([prepare, assets, postDevServer]);
// export const dev = () => gulp.series([prepare, assets, postDevServer]);와 동일. development 단계에서 실행.

// import gulp from "gulp";는 최신 문법
// const gulp = require("gulp"); 위와 동일한 기능. 별도의 설정 없이 실행 가능한 js문법.
// gulpfile.js는 sexy한 최신 javascript 문법 이해불가.
// gulpfile.babel.js로 확장자 변경 + .babelrc 파일 생성: gulp를 babel을 이용하여 컴파일. 최신 js 문법 사용가능해짐.
