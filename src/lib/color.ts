import ColorThief from 'color-thief-browser';
import { rgbToHex } from './utils';

export async function getDominantColorFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const color = new ColorThief().getColor(img);
        resolve(rgbToHex(color[0], color[1], color[2]));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
  });
}

export async function getDominantColorFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = reader.result as string;
      img.onload = () => {
        try {
          const color = new ColorThief().getColor(img);
          resolve(rgbToHex(color[0], color[1], color[2]));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
