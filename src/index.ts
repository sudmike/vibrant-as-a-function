import { Request, Response } from 'express';
import Vibrant from 'node-vibrant';
import axios from 'axios';
import sharp from 'sharp';

export async function vibrant(req: Request, res: Response) {
  // load image from request into buffer
  let image = await getImageFromRequest(req, res);
  if (!image) return;

  // resize the image if too large to be more performant
  image = await downsizeImage(image);

  // get color palette from image buffer
  const palette = await new Vibrant(image).getPalette();

  // map palette to desired format
  const mappedPalette = Object.keys(palette).map((key) => {
    const swatch = palette[key];
    if (swatch)
      return {
        key: key,
        hex: swatch.hex,
        population: swatch.population,
      };
    else
      return {
        key: key,
        hex: '#ffffff',
        population: 0,
      };
  });

  // return color data
  res.send(mappedPalette);
}

/**
 * Gets image from HTTP request or triggers a BadRequest response if nothing can be extracted.
 * @param req HTTP request that contains the image url.
 * @param res HTTP response to use if image url cannot be extracted.
 */
async function getImageFromRequest(
  req: Request,
  res: Response,
): Promise<Buffer | null> {
  // check that url can be extracted from body
  if (!req.body.url) {
    res.status(400).send('Body is missing property "url".');
    return null;
  }

  // check that url is properly formatted
  if (!checkUrlFormat(req.body.url)) {
    res
      .status(400)
      .send(`Property "url" is poorly formatted (${req.body.url}).`);
    return null;
  }

  // get and return image at url
  try {
    const response = await axios.get<ArrayBuffer>(req.body.url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (e) {
    res.status(500).send(`Failed to get image at url ${req.body.url}.`);
    return null;
  }
}

/**
 * Downsize image if it is large.
 * @param image Image buffer that should be resized.
 * @param resizeValue Value that the image is downsized to. Eg if set to 1000 and the images dimensions are 800x2000, the image will be rescaled to 400x1000.
 */
async function downsizeImage(
  image: Buffer,
  resizeValue = 500,
): Promise<Buffer> {
  // load image metadata
  const imageWidth = (await sharp(image).metadata()).width;
  const imageHeight = (await sharp(image).metadata()).height;

  // resize if necessary
  if (Math.max(imageWidth, imageHeight) > resizeValue) {
    // calculate new scale
    const downsizeFactor = resizeValue / Math.max(imageWidth, imageHeight);

    // resize image buffer
    image = await sharp(image)
      .resize(
        Math.floor(imageWidth * downsizeFactor),
        Math.floor(imageHeight * downsizeFactor),
      )
      .toBuffer();
  }

  return image;
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
