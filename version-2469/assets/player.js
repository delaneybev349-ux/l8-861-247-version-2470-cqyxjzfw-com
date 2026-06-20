(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector("[data-play-overlay]");
      var message = box.querySelector("[data-player-message]");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var started = false;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("is-visible");
        }
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function bindStream() {
        if (!stream) {
          showMessage("视频加载失败，请稍后再试");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后再试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          showMessage("视频加载失败，请稍后再试");
        }
      }

      function start() {
        if (!started) {
          started = true;
          bindStream();
        }
        hideOverlay();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", hideOverlay);
    });
  });
})();
