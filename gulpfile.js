const { src, dest, parallel } = require('gulp');
const gulpEsbuild = require('gulp-esbuild')

function js() {
  return src('src/index.js')
      .pipe(gulpEsbuild({
        outfile: 'index.js',
        bundle: true,
    }))
  .pipe(dest('docs/'));
}

function css() {
  return src('style.css')
    .pipe(dest('docs/'));
}

function copy_html() {
  return src('index.html')
  .pipe(dest('docs/'))
}

function copy_worker() {
  return src('src/worker/**/*')
  .pipe(dest('docs/worker/'))
}

function copy_transformers() {
  return src('src/transformer/**/*')
    .pipe(dest('docs/transformer/'))
}


exports.default = parallel(js,css,copy_transformers,copy_worker,copy_html);
