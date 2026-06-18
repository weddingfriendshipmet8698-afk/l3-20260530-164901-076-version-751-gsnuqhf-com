(function () {
  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library did not initialize.'));
        }
      };
      script.onerror = function () {
        reject(new Error('HLS library failed to load.'));
      };
      document.head.appendChild(script);
    });
  }

  function setStatus(player, message) {
    var status = player.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var source = player.getAttribute('data-video-url');
    var started = false;
    if (!video || !button || !source) {
      return;
    }

    button.addEventListener('click', function () {
      if (started) {
        video.play();
        return;
      }
      started = true;
      setStatus(player, '正在初始化 HLS 播放器...');

      function playVideo() {
        player.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
            setStatus(player, '浏览器阻止自动播放，请再次点击视频播放。');
          });
        }
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      loadHls().then(function (Hls) {
        if (!Hls.isSupported()) {
          throw new Error('Current browser does not support HLS playback.');
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus(player, '播放源加载失败，请刷新页面或更换浏览器后重试。');
          }
        });
      }).catch(function () {
        started = false;
        setStatus(player, '当前环境无法加载 HLS 播放器，请检查网络或使用 Safari 浏览器。');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-video-url]'), initPlayer);
  });
}());
