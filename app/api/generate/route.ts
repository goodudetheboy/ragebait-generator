import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { generateScript, generateSpeech } from '@/lib/grok';
import { searchImage, downloadImage } from '@/lib/pexels';
import { createVideo, saveAudioToFile, saveImageToFile, cleanupOldFiles } from '@/lib/video';

export const maxDuration = 300; // 5 minutes max for Vercel Pro
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

    // Cleanup old files
    cleanupOldFiles().catch(console.error);

    // Step 1: Generate script using Grok
    console.log('📝 Generating script...');
    const videoScript = await generateScript(prompt);
    console.log('✅ Script generated:', videoScript);

    // Step 2: Search and download images for each scene
    console.log('🖼️  Searching for images...');
    const imagePaths: string[] = [];
    
    for (let i = 0; i < videoScript.scenes.length; i++) {
      const scene = videoScript.scenes[i];
      console.log(`  Searching for: ${scene.keywords}`);
      
      const imageResult = await searchImage(scene.keywords);
      
      if (!imageResult) {
        console.warn(`  No image found for: ${scene.keywords}, using placeholder`);
        // Use a default placeholder image if search fails
        // For now, throw error - you can add placeholder image later
        throw new Error(`No image found for scene: ${scene.keywords}`);
      }

      const imageBuffer = await downloadImage(imageResult.url);
      const imagePath = path.join(
        process.cwd(),
        'public',
        'temp',
        `image_${Date.now()}_${i}.jpg`
      );
      await saveImageToFile(imageBuffer, imagePath);
      imagePaths.push(imagePath);
      console.log(`  ✅ Downloaded image ${i + 1}`);
    }

    // Step 3: Generate speech using OpenAI TTS
    console.log('🎤 Generating speech...');
    const audioBuffer = await generateSpeech(videoScript.script, 'onyx'); // onyx = deep male voice
    const audioPath = path.join(
      process.cwd(),
      'public',
      'temp',
      `audio_${Date.now()}.mp3`
    );
    await saveAudioToFile(audioBuffer, audioPath);
    console.log('✅ Speech generated');

    // Step 4: Create video
    console.log('🎥 Creating video...');
    const videoFilename = `ragebait_${Date.now()}.mp4`;
    const outputPath = path.join(
      process.cwd(),
      'public',
      'videos',
      videoFilename
    );

    await createVideo({
      scenes: videoScript.scenes,
      imagePaths,
      audioPath,
      outputPath,
    });

    console.log('✅ Video created successfully!');

    // Cleanup temp files
    console.log('🧹 Cleaning up...');
    const fs = require('fs/promises');
    await Promise.all([
      ...imagePaths.map(p => fs.unlink(p).catch(() => {})),
      fs.unlink(audioPath).catch(() => {}),
    ]);

    // Return video URL
    const videoUrl = `/videos/${videoFilename}`;
    return NextResponse.json({
      success: true,
      videoUrl,
      script: videoScript.script,
      scenes: videoScript.scenes,
    });

  } catch (error: any) {
    console.error('❌ Video generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
}

