import buble from "rollup-plugin-buble";
import uglify from "rollup-plugin-uglify";

export default {
  input: "public/sw-install.js",
  output: {
    file: "dist/sw-install.js",
    format: "iife"
  },
  plugins: [buble(), uglify()]
};
