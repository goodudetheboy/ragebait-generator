export interface ImageResult {
  url: string;
  photographer: string;
  source: string;
}

/**
 * Search for an image using Imgur API
 */
export async function searchImage(query: string): Promise<ImageResult | null> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    throw new Error('IMGUR_CLIENT_ID is not configured');
  }

  try {
    // Imgur gallery search endpoint
    const response = await fetch(
      `https://api.imgur.com/3/gallery/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Client-ID ${clientId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Imgur API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      // Find first image (not album/gallery)
      for (const item of data.data) {
        // Skip albums, look for single images
        if (item.type && item.type.startsWith('image/')) {
          return {
            url: item.link,
            photographer: item.account_url || 'Unknown',
            source: 'Imgur',
          };
        }
        // If it's an album, get the first image
        if (item.images && item.images.length > 0) {
          const firstImage = item.images[0];
          if (firstImage.type && firstImage.type.startsWith('image/')) {
            return {
              url: firstImage.link,
              photographer: item.account_url || 'Unknown',
              source: 'Imgur',
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Imgur API error:', errorMessage);
    throw new Error(`Failed to search image: ${errorMessage}`);
  }
}
