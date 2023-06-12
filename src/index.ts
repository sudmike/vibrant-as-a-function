import { Request, Response } from 'express';
import Vibrant from 'node-vibrant';
import axios from 'axios';
import sharp, { Sharp } from 'sharp';

export async function vibrant(req: Request, res: Response) {
  // load image from request into buffer
  const image = await getImageFromRequest(req, res);
  if (!image) return;

  // get color palette from image buffer
  const palette = await new Vibrant(await image.toBuffer()).getPalette();

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

export async function preload(req: Request, res: Response) {
  // load image from request into buffer
  let image = await getImageFromRequest(req, res);
  if (!image) return;

  // generate blurred and smaller image
  image = await generatePreloadedPicture(image);

  // set the response content-type header and return the modified image as a buffer
  res.type(`image/${(await image.metadata()).format.toString()}`);
  res.send(await image.toBuffer());
}

/**
 * Gets image from HTTP request or triggers a BadRequest response if nothing can be extracted.
 * @param req HTTP request that contains the image url.
 * @param res HTTP response to use if image url cannot be extracted.
 */
async function getImageFromRequest(
  req: Request,
  res: Response,
): Promise<Sharp | null> {
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

  try {
    // get image at url
    const response = await axios.get<ArrayBuffer>(req.body.url, {
      responseType: 'arraybuffer',
    });
    const image = sharp(Buffer.from(response.data));

    // return downsized image
    return await downsizeImage(image);
  } catch (e) {
    res.status(500).send(`Failed to get image at url ${req.body.url}.`);
    return null;
  }
}

/**
 * Downsize image if it is large.
 * @param image Image buffer that should be resized.
 * @param resizeValue Value that the image is downsized to. Eg if set to 1000 and the dimensions are 800x2000, the new dimensions will be 400x1000.
 */
async function downsizeImage(image: Sharp, resizeValue = 500): Promise<Sharp> {
  // load image metadata
  const metadata = await image.metadata();
  const imageWidth = metadata.width;
  const imageHeight = metadata.height;

  // resize if necessary
  if (Math.max(imageWidth, imageHeight) > resizeValue) {
    // calculate new scale
    const downsizeFactor = resizeValue / Math.max(imageWidth, imageHeight);

    // resize image buffer
    image = image.resize(
      Math.floor(imageWidth * downsizeFactor),
      Math.floor(imageHeight * downsizeFactor),
    );
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

/**
 * Downsizes and blurs image.
 * Image is passed by reference and will be modified!
 * @param image Jimp image to be modified.
 * @param reduceFactor Factor to reduce size by. Eg if set to 8 and the dimensions are 800x400, the new dimensions will be 100x50
 */
async function generatePreloadedPicture(
  image: Sharp,
  reduceFactor = 5,
): Promise<Sharp> {
  // resize to a lower resolution
  image.resize(
    Math.floor((await image.metadata()).width / reduceFactor),
    Math.floor((await image.metadata()).height / reduceFactor),
  );

  // calculate blur effect
  let blurFactor = Math.ceil(
    Math.min(
      (await image.metadata()).width / reduceFactor,
      (await image.metadata()).height / reduceFactor,
    ) / 100,
  );

  // ensure that blur effect does not exceed min or max
  if (blurFactor > 1000) blurFactor = 1000;
  else if (blurFactor < 0.3) blurFactor = 0.3;

  // apply blur
  return image.blur(blurFactor);
}
