import { nodeResolve } from '@rollup/plugin-node-resolve';

export default () => ({
  input: 'src/module/ckl-advanced-templates-pf1.js',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve()],
});
