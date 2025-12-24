export interface ImageResult {
  url: string;
  photographer: string;
  source: string;
}

/**
 * Search for an image using Serper API (Google Image Search)
 */
export async function searchImage(query: string): Promise<ImageResult | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10, // Get more results to increase chances of finding good images
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      // Get the first image result
      const image = data.images[0];
      return {
        url: image.imageUrl,
        photographer: image.source || 'Google',
        source: 'Serper',
      };
    }

    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Serper API error:', errorMessage);
    throw new Error(`Failed to search image: ${errorMessage}`);
  }
}
