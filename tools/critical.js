const path = require("path");
const critical = require("critical");

critical.generate({
  inline: true,
  base: path.join(__dirname, "../public"),
  src: "index.html",
  dest: "../dist/index.html",
  minify: true,
  width: 1300,
  height: 900
});
