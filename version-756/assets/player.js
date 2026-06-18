import { H as Hls } from "./hls-vendor.js";

export function initPlayer(streamUrl) {
  const player = document.querySelector(".watch-player");

  if (!player || !streamUrl) {
    return;
  }

  const video = player.querySelector("video");
  const layer = player.querySelector(".play-layer");

  if (!video || !layer) {
    return;
  }

  let hls = null;
  let sourceLoaded = false;

  const loadSource = () => {
    if (sourceLoaded) {
      return Promise.resolve();
    }

    sourceLoaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      return new Promise((resolve) => {
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
        hls.on(Hls.Events.ERROR, () => resolve());
        window.setTimeout(resolve, 1000);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  };

  const start = async () => {
    layer.classList.add("is-hidden");
    await loadSource();
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        layer.classList.remove("is-hidden");
      });
    }
  };

  layer.addEventListener("click", start);
  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
