
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';

let production = !process.env.ROLLUP_WATCH
  , output = 'public/usable-gmail.min.js'
;

export default [
  {
    input: 'client.js',
    output: {
      file: output,
      format: 'iife',
      sourcemap: !production,
    },
    plugins: [
      resolve({ browser: true }),
      terser({ output: { comments: false } }),
      !production && livereload({ watch: output }),
    ],
    watch: {
      clearScreen: false,
    },
  }
];
