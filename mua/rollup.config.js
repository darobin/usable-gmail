
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

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
    ],
    watch: {
      clearScreen: false,
    },
  }
];
