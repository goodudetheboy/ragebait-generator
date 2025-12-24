export interface ImageResult {
  url: string;
  photographer: string;
  source: string;
}

/**
 * Check if URL has a valid image format for Sharp/FFmpeg processing
 * Sharp supports: JPEG, PNG, WebP, GIF, AVIF, TIFF
 * We convert everything to JPEG for FFmpeg anyway
 */
function isValidImageFormat(url: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tiff', '.tif'];
  const urlLower = url.toLowerCase();
  
  // Exclude known problematic patterns
  const badPatterns = [
    'instagram.com/seo',
    'lookaside.instagram',
    '/crawler/',
    '/widget/',
  ];
  
  if (badPatterns.some(pattern => urlLower.includes(pattern))) {
    return false;
  }
  
  // Check if URL ends with valid extension or has it before query params
  return validExtensions.some(ext => 
    urlLower.endsWith(ext) || 
    urlLower.includes(ext + '?') ||
    urlLower.includes(ext + '&')
  );
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
      // Filter for valid image formats only
      const validImages = data.images.filter((img: any) => 
        img.imageUrl && isValidImageFormat(img.imageUrl)
      );
      
      if (validImages.length === 0) {
        console.warn('No valid image formats found in Serper results');
        return null;
      }
      
      // Get the first valid image result
      const image = validImages[0];
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

/**
 * Search for multiple images using Serper API with a single query (Economy Mode)
 * Returns up to `count` images from one API call
 */
export async function searchMultipleImages(query: string, count: number = 3): Promise<ImageResult[]> {
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
        num: Math.max(count * 2, 10), // Get extra to ensure we have enough good images
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      // Filter for valid image formats only
      const validImages = data.images.filter((img: any) => 
        img.imageUrl && isValidImageFormat(img.imageUrl)
      );
      
      if (validImages.length === 0) {
        console.warn('No valid image formats found in Serper results');
        return [];
      }
      
      // Return up to `count` valid images
      const results: ImageResult[] = [];
      for (let i = 0; i < Math.min(count, validImages.length); i++) {
        const image = validImages[i];
        results.push({
          url: image.imageUrl,
          photographer: image.source || 'Google',
          source: 'Serper',
        });
      }
      return results;
    }

    return [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Serper API error:', errorMessage);
    throw new Error(`Failed to search images: ${errorMessage}`);
  }
}
