const esbuild = require('esbuild');
const glob = require("tiny-glob");

(async () => {
  const entryPoints = await glob("./src/**/*.ts");
  esbuild
    .build({
      outbase: 'src',
      outdir: 'dist',
      // esbuild's [`entryPoints` does not support glob patterns](https://github.com/evanw/esbuild/issues/381)
      entryPoints: entryPoints, 
      bundle: true,
      platform: 'node',
      target: ['node16.15.1'],

      bundle: true,
      sourcemap: true,
      minify: true,
      splitting: true,
      format: 'esm',
      target: ['es2019']
    })
    .catch(() => process.exit(1));
})();

