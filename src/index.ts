import { Request, Response } from 'express';

export function vibrant(req: Request, res: Response) {
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

  // ... get color from image at url
  res.send('Success!');
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
