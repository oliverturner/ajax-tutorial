module.exports = {
  skipWaiting: true,
  clientsClaim: true,
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,map,ico,jpg,png,json,css,html}"],
  swDest: "dist/sw.js",
  globIgnores: ["../workbox-cli-config.js"]
};
