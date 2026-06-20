(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-video");
        var button = document.getElementById("movie-play");
        var hls = null;
        var attached = false;

        if (!video || !button || !source) {
            return;
        }

        function hideButton() {
            button.classList.add("hidden");
        }

        function showButton() {
            if (video.paused) {
                button.classList.remove("hidden");
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            hideButton();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", hideButton);
        video.addEventListener("pause", showButton);
        video.addEventListener("ended", showButton);
        video.addEventListener("error", function () {
            button.classList.remove("hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
