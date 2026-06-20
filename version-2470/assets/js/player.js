(function() {
  function createMoviePlayer(config) {
    var video = document.querySelector(config.videoSelector);
    var button = document.querySelector(config.buttonSelector);
    var source = config.source;
    var hls = null;
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal && button) {
            button.hidden = false;
            button.querySelector("strong").textContent = "稍后重试";
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (button) {
        button.querySelector("strong").textContent = "视频暂时无法播放";
      }
    }

    function start() {
      if (!video) {
        return;
      }

      prepare();

      var playPromise = video.play();

      if (button) {
        button.hidden = true;
      }

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          if (button) {
            button.hidden = false;
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function() {
        if (button) {
          button.hidden = true;
        }
      });

      video.addEventListener("pause", function() {
        if (button && video.currentTime === 0) {
          button.hidden = false;
        }
      });

      video.addEventListener("ended", function() {
        if (button) {
          button.hidden = false;
        }
      });
    }

    window.addEventListener("beforeunload", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.createMoviePlayer = createMoviePlayer;
})();
