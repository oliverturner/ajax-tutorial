const stripString = (input, strip) => {
  if (input.endsWith(strip)) {
    return input.substring(0, input.length - strip.length);
  }

  return input;
};

if (location.port !== "3000" && navigator.serviceWorker) {
  // Set up auto-updating for SW (if supported)
  if (window.BroadcastChannel) {
    const noAction = url => url;
    const stripHtml = url => stripString(url, ".html");
    const stripIndex = url => stripString(url, "index");
    const updateChannel = new window.BroadcastChannel("precache-updates");
    const mutations = [noAction, stripHtml, stripIndex];

    updateChannel.addEventListener("message", event => {
      let updatedUrl = event.data.payload.updatedUrl;
      mutations.forEach(mutationfunc => {
        updatedUrl = mutationfunc(updatedUrl);
        if (updatedUrl === location.href) {
          console.log("This page has been updated. Please refresh the page.");
        }
      });
    });
  }

  // Initialise SW
  navigator.serviceWorker.register("/sw.js").catch(function(err) {
    console.error("Unable to register service worker.", err);
  });
}
