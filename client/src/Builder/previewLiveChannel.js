const LIVE_CHANNEL_NAME = "wb:preview:live:v1";

let liveChannel = null;
const localListeners = new Map();

const getLiveChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel !== "function") {
    return null;
  }
  if (!liveChannel) {
    try {
      liveChannel = new BroadcastChannel(LIVE_CHANNEL_NAME);
    } catch {
      liveChannel = null;
    }
  }
  return liveChannel;
};

const notifyLocal = (kind, payload) => {
  const bucket = localListeners.get(kind);
  if (!bucket || payload == null) return;
  bucket.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      // Ignore live preview listener errors.
    }
  });
};

export const broadcastPreviewLive = (kind, payload) => {
  if (!kind || payload == null) return;
  notifyLocal(kind, payload);
  const channel = getLiveChannel();
  if (!channel) return;
  try {
    channel.postMessage({ kind, payload });
  } catch {
    // Ignore live preview broadcast errors.
  }
};

export const subscribePreviewLive = (kind, onPayload) => {
  if (!kind || typeof onPayload !== "function") return () => {};
  let bucket = localListeners.get(kind);
  if (!bucket) {
    bucket = new Set();
    localListeners.set(kind, bucket);
  }
  bucket.add(onPayload);

  const channel = getLiveChannel();
  const handleMessage = (event) => {
    if (event?.data?.kind === kind && event.data.payload != null) {
      onPayload(event.data.payload);
    }
  };
  channel?.addEventListener("message", handleMessage);

  return () => {
    bucket.delete(onPayload);
    if (bucket.size === 0) localListeners.delete(kind);
    channel?.removeEventListener("message", handleMessage);
  };
};
