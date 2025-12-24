import { NextRequest, NextResponse } from 'next/server';
import { generateScript, generateSpeech, ELEVENLABS_VOICES } from '@/lib/grok';
import { searchImage as searchPexels } from '@/lib/pexels';
import { searchImage as searchSerper } from '@/lib/serper';
import sharp from 'sharp';

export const maxDuration = 60; // Only need 60s for script + image search + TTS
export const dynamic = 'force-dynamic';

/**
 * Download and compress an image from a URL
 * This is needed for Serper images which can be huge (10MB+)
 */
async function downloadAndCompressImage(url: string): Promise<string> {
  try {
    console.log(`  Downloading image: ${url.substring(0, 100)}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`  Original size: ${Math.round(buffer.length / 1024)}KB`);
    
    // Resize and compress image
    const compressed = await sharp(buffer)
      .resize(1080, null, { // Max width 1080px, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 75 }) // Compress to JPEG with 75% quality
      .toBuffer();
    
    console.log(`  Compressed size: ${Math.round(compressed.length / 1024)}KB`);
    
    // Convert to base64 data URL
    const base64 = compressed.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error(`  Failed to download/compress image:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Password verification
    const { password, prompt, voice, images, imageSource } = await req.json();
    
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
      const searchFunction = useSerper ? searchSerper : searchPexels;
      const sourceName = useSerper ? 'Serper' : 'Pexels';
      
      console.log(`  Searching ${sourceName}...`);
      for (let i = 0; i < videoScript.scenes.length; i++) {
        const scene = videoScript.scenes[i];
        console.log(`  Searching for: ${scene.keywords}`);
        
        const imageResult = await searchFunction(scene.keywords);
        
        if (!imageResult) {
          console.warn(`  No image found for: ${scene.keywords}, using placeholder`);
          throw new Error(`No image found for scene: ${scene.keywords}`);
        }

        // For Serper, download and compress the image first
        // (Google images can be huge and cause memory issues in FFmpeg)
        if (useSerper) {
          console.log(`  Compressing Serper image ${i + 1}...`);
          const compressedDataUrl = await downloadAndCompressImage(imageResult.url);
          imageUrls.push(compressedDataUrl);
        } else {
          // Pexels images are already optimized
          imageUrls.push(imageResult.url);
        }
        
        console.log(`  ✅ Found image ${i + 1}`);
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

