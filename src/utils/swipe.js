const onGesture = swipeHandlers => (
  touchstartX,
  touchstartY,
  touchendX,
  touchendY
) => {
  if (touchendX < touchstartX) {
    swipeHandlers["swipeLeft"] && swipeHandlers["swipeLeft"]();
  }
  if (touchendX > touchstartX) {
    swipeHandlers["swipeRight"] && swipeHandlers["swipeRight"]();
  }
  if (touchendY < touchstartY) {
    swipeHandlers["swipeDown"] && swipeHandlers["swipeDown"]();
  }
  if (touchendY > touchstartY) {
    swipeHandlers["swipeUp"] && swipeHandlers["swipeUp"]();
  }
  if (touchendY === touchstartY) {
    swipeHandlers["tap"] && swipeHandlers["tap"]();
  }
};

export default ($el, swipeHandlers) => {
  const onTouchEnd = onGesture(swipeHandlers);

  let touchstartX;
  let touchstartY;
  let touchendX;
  let touchendY;

  $el.addEventListener(
    "touchstart",
    function(event) {
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
    },
    { passive: true }
  );

  $el.addEventListener(
    "touchend",
    function(event) {
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      onTouchEnd(touchstartX, touchstartY, touchendX, touchendY);
    },
    { passive: true }
  );
};
