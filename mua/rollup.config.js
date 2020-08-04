
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';

let production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'client.js',
    output: {
      file: 'usable-gmail.min.js',
      format: 'iife',
      sourcemap: !production,
    },
    plugins: [
      resolve({ browser: true }),
      terser({ output: { comments: false } }),
      !production && livereload({ watch: './usable-gmail.min.js' }),
    ],
    watch: {
      clearScreen: false,
    },
  }
];
