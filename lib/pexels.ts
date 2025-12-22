import { createClient } from 'pexels';

export interface ImageResult {
  url: string;
  photographer: string;
  source: string;
}

/**
 * Search for an image using Pexels API
 */
export async function searchImage(query: string): Promise<ImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not configured');
  }

  try {
    const client = createClient(apiKey);
    const result = await client.photos.search({
      query,
      per_page: 5,
      orientation: 'portrait', // Better for 9:16 vertical video
    });

    if ('photos' in result && result.photos.length > 0) {
      const photo = result.photos[0];
      return {
        url: photo.src.large,
        photographer: photo.photographer,
        source: 'Pexels',
      };
    }

    return null;
  } catch (error: any) {
    console.error('Pexels API error:', error.message);
    throw new Error(`Failed to search image: ${error.message}`);
  }
}

/**
 * Download image from URL
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error('Image download error:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

