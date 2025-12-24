import { NextRequest, NextResponse } from 'next/server';
import { generateScript, generateSpeech, ELEVENLABS_VOICES } from '@/lib/grok';
import { searchImage as searchPexels } from '@/lib/pexels';
import { searchImage as searchSerper, searchMultipleImages as searchSerperMultiple } from '@/lib/serper';
import sharp from 'sharp';

export const maxDuration = 60; // Only need 60s for script + image search + TTS
export const dynamic = 'force-dynamic';

/**
 * Download and compress an image from a URL
 * This is needed for Serper images which can be huge (10MB+)
 * Forces images to be under MAX_IMAGE_SIZE_KB to prevent FFmpeg crashes
 */
async function downloadAndCompressImage(url: string, maxSizeKB: number = 500): Promise<string> {
  try {
    console.log(`  Downloading image: ${url.substring(0, 100)}...`);
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); // 10s timeout
    
    if (!response.ok) {
      throw new Error(`IMAGE DOWNLOAD FAILED (${response.status})`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalSizeKB = Math.round(buffer.length / 1024);
    
    console.log(`  Original size: ${originalSizeKB}KB`);
    
    // Try different compression levels until under maxSizeKB
    const compressionLevels = [
      { width: 1080, quality: 75 },
      { width: 800, quality: 70 },
      { width: 600, quality: 65 },
      { width: 540, quality: 60 },
    ];
    
    let compressed: Buffer | null = null;
    let compressedSizeKB = 0;
    
    for (const level of compressionLevels) {
      compressed = await sharp(buffer)
        .resize(level.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: level.quality })
        .toBuffer();
      
      compressedSizeKB = Math.round(compressed.length / 1024);
      console.log(`  Compressed (${level.width}px, ${level.quality}%): ${compressedSizeKB}KB`);
      
      if (compressedSizeKB <= maxSizeKB) {
        break;
      }
    }
    
    if (!compressed) {
      throw new Error('IMAGE COMPRESSION FAILED');
    }
    
    if (compressedSizeKB > maxSizeKB) {
      console.warn(`  ⚠️ Image still ${compressedSizeKB}KB after compression (target: ${maxSizeKB}KB)`);
      // Continue anyway with most compressed version
    }
    
    console.log(`  ✅ Final size: ${compressedSizeKB}KB`);
    
    // Convert to base64 data URL
    const base64 = compressed.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'UNKNOWN ERROR';
    console.error(`  ❌ Image processing failed:`, errorMessage);
    throw new Error(`IMAGE PROCESSING FAILED: ${errorMessage}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Password verification
    const { password, prompt, voice, images, imageSource, serperEconomyMode } = await req.json();
    
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Validate that we have either prompt or images
    if ((!prompt || typeof prompt !== 'string') && (!images || !Array.isArray(images) || images.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or images required' },
        { status: 400 }
      );
    }

    // Validate voice if provided (optional, defaults to elli)
    const selectedVoice = voice || 'elli';
    
    const hasImages = images && Array.isArray(images) && images.length > 0;
    const hasPrompt = prompt && typeof prompt === 'string' && prompt.trim().length > 0;

    console.log('🎬 Starting video generation');
    console.log('  - Prompt:', hasPrompt ? prompt : 'None (using images only)');
    console.log('  - Images:', hasImages ? `${images.length} uploaded` : `None (using ${imageSource === 'serper' ? 'Serper' : 'Pexels'})`);
    console.log('  - Serper Economy Mode:', imageSource === 'serper' && serperEconomyMode ? 'Enabled' : 'Disabled');

    // Step 1: Generate script using Grok (with vision if images provided)
    console.log('📝 Generating script...');
    const videoScript = await generateScript(
      prompt || 'Create provocative ragebait content about this',
      hasImages ? images : undefined
    );
    console.log('✅ Script generated:', videoScript);

    // Step 2: Get images (either from upload or Pexels search)
    console.log('🖼️  Getting images...');
    const imageUrls: string[] = [];
    
    if (hasImages) {
      // Use uploaded images (convert base64 to data URLs)
      console.log('  Using uploaded images');
      for (let i = 0; i < Math.min(images.length, videoScript.scenes.length); i++) {
        const dataUrl = `data:image/jpeg;base64,${images[i]}`;
        imageUrls.push(dataUrl);
        console.log(`  ✅ Using uploaded image ${i + 1}`);
      }
    } else {
      // Search for images using selected source (Pexels or Serper)
      const useSerper = imageSource === 'serper';
      const sourceName = useSerper ? 'Serper' : 'Pexels';
      
      console.log(`  Searching ${sourceName}...`);
      
      // Economy Mode for Serper: Use one query to get all images
      if (useSerper && serperEconomyMode) {
        console.log(`  💰 Economy Mode: Single query for ${videoScript.scenes.length} images`);
        console.log(`  Searching for: ${prompt || 'ragebait content'}`);
        
        const imageResults = await searchSerperMultiple(prompt || 'ragebait content', videoScript.scenes.length);
        
        if (!imageResults || imageResults.length === 0) {
          throw new Error('No images found in economy mode');
        }
        
        if (imageResults.length < videoScript.scenes.length) {
          console.warn(`  ⚠️ Only found ${imageResults.length} images, needed ${videoScript.scenes.length}`);
        }
        
        // Process all images
        for (let i = 0; i < Math.min(imageResults.length, videoScript.scenes.length); i++) {
          console.log(`  Compressing image ${i + 1}...`);
          try {
            const compressedDataUrl = await downloadAndCompressImage(imageResults[i].url, 500);
            imageUrls.push(compressedDataUrl);
            console.log(`  ✅ Image ${i + 1} compressed successfully`);
          } catch (compressionError) {
            const errMsg = compressionError instanceof Error ? compressionError.message : 'Unknown error';
            console.error(`  ❌ Failed to compress image ${i + 1}:`, errMsg);
            throw new Error(`Failed to process image ${i + 1}: ${errMsg}`);
          }
        }
        
        console.log(`  💰 Economy Mode: 1 API call saved ${videoScript.scenes.length - 1} queries!`);
      } else {
        // Normal mode: Query each scene individually
        for (let i = 0; i < videoScript.scenes.length; i++) {
          const scene = videoScript.scenes[i];
          console.log(`  Searching for: ${scene.keywords}`);
          
          const searchFunction = useSerper ? searchSerper : searchPexels;
          const imageResult = await searchFunction(scene.keywords);
          
          if (!imageResult) {
            console.warn(`  No image found for: ${scene.keywords}, using placeholder`);
            throw new Error(`No image found for scene: ${scene.keywords}`);
          }

          // For Serper, download and compress the image first
          // (Google images can be huge and cause memory issues in FFmpeg)
          if (useSerper) {
            console.log(`  Compressing Serper image ${i + 1}...`);
            try {
              const compressedDataUrl = await downloadAndCompressImage(imageResult.url, 500); // Max 500KB per image
              imageUrls.push(compressedDataUrl);
              console.log(`  ✅ Image ${i + 1} compressed successfully`);
            } catch (compressionError) {
              const errMsg = compressionError instanceof Error ? compressionError.message : 'Unknown error';
              console.error(`  ❌ Failed to compress image ${i + 1}:`, errMsg);
              throw new Error(`Failed to process image ${i + 1}: ${errMsg}`);
            }
          } else {
            // Pexels images are already optimized
            imageUrls.push(imageResult.url);
            console.log(`  ✅ Image ${i + 1} found`);
          }
        }
      }
    }

    // Step 3: Generate speech using ElevenLabs TTS
    console.log(`🎤 Generating speech with voice: ${selectedVoice}...`);
    // Get voice ID from ELEVENLABS_VOICES or use as custom voice ID
    const voiceId = ELEVENLABS_VOICES[selectedVoice as keyof typeof ELEVENLABS_VOICES] || selectedVoice;
    const audioBuffer = await generateSpeech(videoScript.script, voiceId);
    const audioBase64 = audioBuffer.toString('base64');
    console.log('✅ Speech generated');

    // Return everything to frontend for video processing
    return NextResponse.json({
      success: true,
      script: videoScript.script,
      scenes: videoScript.scenes,
      imageUrls,
      audioBase64, // Send audio as base64
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    
    // Provide more descriptive error messages
    let errorMessage = 'Failed to generate video';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add context to common errors
      if (errorMessage.includes('IMAGE')) {
        // Already descriptive from our compression function
      } else if (errorMessage.includes('fetch')) {
        errorMessage = 'NETWORK ERROR - Failed to fetch resources';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'TIMEOUT - Request took too long';
      } else if (errorMessage.includes('No image found')) {
        // Already descriptive
      } else if (errorMessage.toLowerCase().includes('memory')) {
        errorMessage = 'OUT OF MEMORY - Images too large';
      } else if (!errorMessage.includes('FAILED')) {
        // Generic error, make it uppercase for consistency
        errorMessage = errorMessage.toUpperCase();
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

