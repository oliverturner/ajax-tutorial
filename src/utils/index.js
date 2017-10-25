export const onError = err => {
  console.log("onError", err.message);
};

export const clearChildren = parent => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
};

export const ignoreArrowClicks = event => {
  if (event.code === "ArrowRight" || event.code === "ArrowLeft") {
    event.stopPropagation();
  }
};

/**
 * Merge together default and user configs
 * @param {*} defaultConfig 
 * @param {*} userConfig 
 */
export const mergeConfigs = (defaultConfig, userConfig) => {
  const { appName } = userConfig.unsplash;

  const cb = (ret, key) => {
    ret[key] = Object.assign({}, defaultConfig[key], userConfig[key]);
    return ret;
  };

  const initial = {
    utm: `utm_source=${appName}&utm_medium=referral&utm_campaign=api-credit`
  };

  return Object.keys(defaultConfig).reduce(cb, initial);
};
