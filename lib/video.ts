import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { SceneDescription } from './grok';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface VideoGenerationOptions {
  scenes: SceneDescription[];
  imagePaths: string[];
  audioPath: string;
  outputPath: string;
}

/**
 * Create a 9:16 vertical video from images, captions, and audio
 */
export async function createVideo(options: VideoGenerationOptions): Promise<string> {
  const { scenes, imagePaths, audioPath, outputPath } = options;

  if (scenes.length !== imagePaths.length) {
    throw new Error('Number of scenes and images must match');
  }

  try {
    // Create temp directory for processed images (use /tmp for Vercel)
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const processedImages: string[] = [];

    // Process each image: resize to 9:16 (1080x1920) and add text overlay
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const inputImage = imagePaths[i];
      const outputImage = path.join(tempDir, `scene_${i}_${Date.now()}.jpg`);

      await new Promise<void>((resolve, reject) => {
        // Create filter for text overlay with shadow/outline effect
        // Use sans-serif (built-in, no file needed)
        const textFilter = `drawtext=text='${escapeText(scene.caption)}':` +
          `fontsize=80:` +
          `fontcolor=white:` +
          `box=1:` +
          `boxcolor=black@0.5:` +
          `boxborderw=10:` +
          `x=(w-text_w)/2:` + // Center horizontally
          `y=h-200`; // 200px from bottom

        ffmpeg(inputImage)
          .outputOptions([
            '-vf',
            `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${textFilter}`,
          ])
          .output(outputImage)
          .on('end', () => {
            processedImages.push(outputImage);
            resolve();
          })
          .on('error', (err) => reject(err))
          .run();
      });
    }

    // Create concat file for FFmpeg
    const concatFile = path.join(tempDir, `concat_${Date.now()}.txt`);
    let concatContent = '';
    for (let i = 0; i < processedImages.length; i++) {
      concatContent += `file '${processedImages[i]}'\n`;
      concatContent += `duration ${scenes[i].duration}\n`;
    }
    // Add last image again (FFmpeg concat requirement)
    concatContent += `file '${processedImages[processedImages.length - 1]}'\n`;
    await fs.writeFile(concatFile, concatContent);

    // Combine images with audio
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .input(audioPath)
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-shortest',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart', // Enable streaming
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Cleanup temp files
    await Promise.all([
      ...processedImages.map(img => fs.unlink(img).catch(() => {})),
      fs.unlink(concatFile).catch(() => {}),
    ]);

    return outputPath;
  } catch (error: any) {
    console.error('Video creation error:', error.message);
    throw new Error(`Failed to create video: ${error.message}`);
  }
}

/**
 * Escape text for FFmpeg drawtext filter
 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

/**
 * Save audio buffer to file
 */
export async function saveAudioToFile(audioBuffer: Buffer, outputPath: string): Promise<string> {
  await fs.writeFile(outputPath, audioBuffer);
  return outputPath;
}

/**
 * Save image buffer to file
 */
export async function saveImageToFile(imageBuffer: Buffer, outputPath: string): Promise<string> {
  await fs.writeFile(outputPath, imageBuffer);
  return outputPath;
}

/**
 * Clean up old files in temp directory (older than 1 hour)
 */
export async function cleanupOldFiles() {
  const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public', 'temp');
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  try {
    await cleanDirectory(tempDir, oneHourAgo);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

async function cleanDirectory(dir: string, olderThan: number) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.mtimeMs < olderThan) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    // Directory might not exist yet
  }
}

