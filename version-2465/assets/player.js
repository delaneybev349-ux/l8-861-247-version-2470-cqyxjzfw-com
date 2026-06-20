(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.poster-button');
            var message = player.querySelector('.player-message');
            var streamUrl = player.getAttribute('data-play-url');
            var hlsInstance = null;
            var streamAttached = false;

            function setMessage(value) {
                if (message) {
                    message.textContent = value || '';
                }
            }

            function attachStream() {
                if (!video || !streamUrl || streamAttached) {
                    return;
                }
                streamAttached = true;
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setMessage('暂时无法播放，请稍后再试');
                        }
                    });
                    return;
                }

                setMessage('暂时无法播放，请稍后再试');
            }

            function startPlayback() {
                if (!video) {
                    return;
                }
                setMessage('');
                attachStream();
                if (button) {
                    button.classList.add('hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        startPlayback();
                    }
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                });
                video.addEventListener('ended', function () {
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
}());
