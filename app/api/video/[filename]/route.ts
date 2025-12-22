import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Validate filename (security check)
    if (!filename || !filename.endsWith('.mp4') || filename.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Get video path (from /tmp on Vercel, or public/videos locally)
    const videoDir = process.env.VERCEL 
      ? '/tmp' 
      : path.join(process.cwd(), 'public', 'videos');
    const videoPath = path.join(videoDir, filename);

    // Read video file
    const videoBuffer = await readFile(videoPath);

    // Return video with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Video serve error:', error.message);
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    );
  }
}

