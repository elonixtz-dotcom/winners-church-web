import { createServerEntry } from '../dist/server/index.js';
import { getManifestEntry } from '@tanstack/react-start/server';

const manifest = getManifestEntry();

export default async (req, res) => {
  try {
    const serverEntry = createServerEntry();
    const response = await serverEntry.fetch(new Request(
      `${req.protocol}://${req.headers.host}${req.url}`,
      {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      }
    ));

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
