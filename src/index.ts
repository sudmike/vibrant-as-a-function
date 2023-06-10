import { Request, Response } from 'express';
import Vibrant from 'node-vibrant';
import axios from 'axios';
import sharp from 'sharp';

export async function vibrant(req: Request, res: Response) {
  const imageUrl = req.body.url;

  // check that url can be extracted from body
  if (!imageUrl) {
    res.status(400).send('Body is missing property "url".');
    return;
  }

  // check that url is properly formatted
  if (!checkUrlFormat(imageUrl)) {
    res.status(400).send(`Property "url" is poorly formatted (${imageUrl}).`);
    return;
  }

  // load image at url into buffer
  let imageBuffer = await getImageBufferFromUrl(imageUrl);

  // load image metadata and resize if too large to be more performant
  const maxDimension = 500;
  const imageWidth = (await sharp(imageBuffer).metadata()).width;
  const imageHeight = (await sharp(imageBuffer).metadata()).height;
  if (Math.max(imageWidth, imageHeight) > maxDimension) {
    // calculate new scale
    const downsizeFactor = maxDimension / Math.max(imageWidth, imageHeight);
    const imageWidthNew = Math.floor(imageWidth * downsizeFactor);
    const imageHeightNew = Math.floor(imageHeight * downsizeFactor);

    // resize image buffer
    imageBuffer = await sharp(imageBuffer)
      .resize(imageWidthNew, imageHeightNew)
      .toBuffer();
  }

  // get color palette from image buffer
  const palette = await new Vibrant(imageBuffer).getPalette();

  // map palette to desired format
  const mappedPalette = Object.keys(palette).map((key) => {
    const swatch = palette[key];
    return {
      key: key,
      hex: swatch.hex,
      population: swatch.population,
    };
  });

  // return color data
  res.send(mappedPalette);
}

/**
 * Checks if the passed argument is formatted as a valid URL.
 * @param url Argument that is checked.
 */
function checkUrlFormat(url: string): boolean {
  const urlPattern = new RegExp(
    'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
  );
  return urlPattern.test(url);
}

/**
 * Gets image from a URL and returns an image buffer containing the image.
 * @param url URL of the image.
 */
async function getImageBufferFromUrl(url: string): Promise<Buffer> {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}
