import { NextRequest, NextResponse } from 'next/server';
import { generateScript, generateSpeech } from '@/lib/grok';
import { searchImage } from '@/lib/pexels';

export const maxDuration = 60; // Only need 60s for script + image search + TTS
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Password verification
    const { password, prompt } = await req.json();
    
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🎬 Starting video generation for prompt:', prompt);

    // Step 1: Generate script using Grok
    console.log('📝 Generating script...');
    const videoScript = await generateScript(prompt);
    console.log('✅ Script generated:', videoScript);

    // Step 2: Search for images (just get URLs, don't download)
    console.log('🖼️  Searching for images...');
    const imageUrls: string[] = [];
    
    for (let i = 0; i < videoScript.scenes.length; i++) {
      const scene = videoScript.scenes[i];
      console.log(`  Searching for: ${scene.keywords}`);
      
      const imageResult = await searchImage(scene.keywords);
      
      if (!imageResult) {
        console.warn(`  No image found for: ${scene.keywords}, using placeholder`);
        throw new Error(`No image found for scene: ${scene.keywords}`);
      }

      imageUrls.push(imageResult.url);
      console.log(`  ✅ Found image ${i + 1}`);
    }

    // Step 3: Generate speech using OpenAI TTS
    console.log('🎤 Generating speech...');
    const audioBuffer = await generateSpeech(videoScript.script, 'onyx');
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

  } catch (error: any) {
    console.error('❌ Video generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
}

