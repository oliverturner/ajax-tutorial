import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import uglify from "rollup-plugin-uglify";
import browsersync from "rollup-plugin-browsersync";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const bSyncConfig = {
  server: ["public", "dist"],
  files: ["dist/app.js", "public/assets/styles.css", "public/index.html"]
};

// Translate `imports` to `requires`
// Convert ES6 modules to CJS modules
// Convert ES6 syntax to ES5
// Minify in production
const plugins = production
  ? [resolve(), commonjs(), buble(), uglify()]
  : [resolve(), commonjs(), browsersync(bSyncConfig)];

export default {
  input: "src/app.js",
  output: {
    name: "Meteoropolis",
    file: "dist/app.js",
    format: "iife",
    sourcemap: !production
  },
  watch: {
    include: "src/**"
  },
  plugins
};
