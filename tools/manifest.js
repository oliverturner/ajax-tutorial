const path = require("path");
const fs = require("fs");
const writeFile = require("write");

const pkg = require("../package.json");
const base = path.resolve(__dirname, "..");
const { dirs, urls } = pkg.app;

const iconDir = path.resolve(base, dirs.icons);
const iconUrl = `${urls.base}/${urls.icons}`;
const iconRegex = /(\d{1,3}x\d\d{1,3}).png$/;
const manifestDest = path.resolve(base, dirs.docRoot, urls.manifest);

const getIcons = (dir, regex, url) =>
  fs
    .readdirSync(dir)
    .filter(icon => regex.exec(icon))
    .map(file => ({
      src: `${url}/${file}`,
      sizes: regex.exec(file)[1],
      type: "image/png"
    }));

const getManifest = () => {
  const icons = getIcons(iconDir, iconRegex, iconUrl);
  return Object.assign({}, pkg.app.manifest, { icons });
};

const onError = err => console.log(err);

writeFile(manifestDest, JSON.stringify(getManifest(), null, 2), onError);
