export function range(length) {
  return Array.from({ length }, (_, i) => i);
}

export function zip(a, b) {
  return a.map((x, i) => [x, b[i]]);
}

export async function loadUrlAsElement(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    image.src = url;
  });
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export async function loadUrlAsPixelData(url) {
  const image = await loadUrlAsElement(url);
  return convertImageToPixelData(image);
}

export function convertImageToImageData(image) {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function convertImageToPixelData(image) {
  return convertImageDataToPixelData(convertImageToImageData(image));
}

export function convertImageDataToPixelData(imageData) {
  const { data } = imageData;
  const ret = [];
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    // const green = data[i + 1];
    // const blue = data[i + 2];
    const alpha = data[i + 3];
    let color = 0;
    if (alpha === 255 && red < 128) {
      color = 1;
    }
    ret.push(color);
  }
  return ret;
}

export function createCanvasContext({ width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
}

export function attrToProp(attr) {
  return attr
    .replace(/^data-/, "")
    .replace(/-([a-z])/g, (_, s) => s.toUpperCase());
}

export async function playSound(audio, volume) {
  return new Promise(async (resolve, reject) => {
    const abortController = new AbortController();
    try {
      if (volume === 0) {
        return;
      }
      audio.currentTime = 0;
      const { signal } = abortController;
      audio.addEventListener(
        "ended",
        () => {
          resolve();
        },
        { signal }
      );
      audio.addEventListener(
        "error",
        () => {
          reject(new Error("Failed to play sound"));
        },
        { signal }
      );
      if (audio) {
        audio.volume = volume;
        await audio.play();
      }
    } catch (err) {
      reject(err);
    } finally {
      resolve();
      abortController.abort();
    }
  });
}
