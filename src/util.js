export function range(length) {
  return Array.from({ length }, (_, i) => i);
}

export function zip(a, b) {
  return a.map((x, i) => [x, b[i]]);
}

async function loadImageAsElement(url) {
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

export async function loadImageAsPixelData(url) {
  const image = await loadImageAsElement(url);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const ret = [];
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    // const green = data[i + 1];
    // const blue = data[i + 2];
    const alpha = data[i + 3];
    if (alpha < 128) {
      ret.push(0);
    } else if (red < 85) {
      ret.push(3);
    } else if (red < 170) {
      ret.push(2);
    } else {
      ret.push(1);
    }
  }
  return ret;
}
