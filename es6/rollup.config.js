import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import uglify from "rollup-plugin-uglify";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/app.js",
  output: {
		file: production ? "dist/app.js" : "public/app.js",
    name: "CityWeather",
    format: "iife",
    sourcemap: true
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		buble(),
    production && uglify() // minify, but only in production
  ]
};
