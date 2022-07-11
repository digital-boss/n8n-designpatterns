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
    })
    .catch(() => process.exit(1));
})();

