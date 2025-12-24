'use client';

import { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Check if SharedArrayBuffer is available
  const [hasSharedArrayBuffer, setHasSharedArrayBuffer] = useState(true);
 
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('elli'); // Default voice
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // Base64 images
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]); // For preview
  const [showImageUpload, setShowImageUpload] = useState(false); // Collapsible section
  const [showVoiceSelector, setShowVoiceSelector] = useState(false); // Collapsible section
  const [enableSubtitles, setEnableSubtitles] = useState(false); // Subtitle toggle
  const [imageSource, setImageSource] = useState<'pexels' | 'imgur'>('pexels'); // Image source toggle
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoData, setVideoData] = useState<{
    script: string;
    scenes: Array<{ caption: string; duration: number; keywords: string }>;
  } | null>(null);
  
  // Ragebait Engine (FFmpeg) state
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState('');
  
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Random title options
  const titleOptions = [
    'RAGEBAIT ANYTHING',
    'RAGEBAIT YOUR DOG',
    'RAGEBAIT YOUR NEIGHBOR',
    'RAGEBAIT A *****',
    'RAGEBAIT YOUR MIL',
    'RAGEBAIT X',
    'RAGEBAIT YOURSELF',
    'RAGEBAIT A KINDERGARTENER',
    'RAGEBAIT YOUR SO',
    'RAGEBAIT TIKTOK',
    'RAGEBAIT FACEBOOK',
    'RAGEBAIT A GERIATRIC',
    'RAGEBAIT INSTAGRAM'
  ];

  const [randomTitle, setRandomTitle] = useState(titleOptions[0]);

  // Check localStorage on mount and auto-load engine
  useEffect(() => {
    // Pick random title
    const randomIndex = Math.floor(Math.random() * titleOptions.length);
    setRandomTitle(titleOptions[randomIndex]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check if SharedArrayBuffer is available
    if (typeof SharedArrayBuffer === 'undefined') {
      setHasSharedArrayBuffer(false);
      return;
    }
    
    const storedPassword = localStorage.getItem('ragebait_password');
    if (storedPassword) {
      // Verify stored password is still valid
      verifyPassword(storedPassword, true);
    }
    
    // Auto-load Ragebait Engine on mount (only once)
    if (!engineLoaded && !engineLoading && !ffmpegRef.current) {
      loadRagebaitEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Ragebait Engine (FFmpeg)
  const loadRagebaitEngine = async () => {
    setEngineLoading(true);
    setEngineError('');
    
    try {
      console.log('🔥 Loading Ragebait Engine...');
      
      // Check if SharedArrayBuffer is available
      if (typeof SharedArrayBuffer === 'undefined') {
        throw new Error('BROWSER NOT SUPPORTED - NEEDS SHAREDARRAYBUFFER');
      }
      
      const ffmpeg = new FFmpeg();
      
      // Log FFmpeg messages
      ffmpeg.on('log', ({ message }) => {
        console.log('Ragebait Engine:', message);
      });
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpegRef.current = ffmpeg;
      setEngineLoaded(true);
      console.log('✅ Ragebait Engine loaded successfully!');
    } catch (err) {
      console.error('❌ Ragebait Engine load error:', err);
      const errorMsg = err instanceof Error ? err.message : 'FAILED TO LOAD ENGINE';
      setEngineError(errorMsg.toUpperCase());
    } finally {
      setEngineLoading(false);
    }
  };

  const verifyPassword = async (password: string, silent = false) => {
    if (!silent) setAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ragebait_password', password);
        setIsAuthenticated(true);
      } else {
        if (!silent) setAuthError('WRONG PASSWORD BRO');
        localStorage.removeItem('ragebait_password');
      }
    } catch {
      if (!silent) setAuthError('VERIFICATION FAILED');
      localStorage.removeItem('ragebait_password');
    } finally {
      if (!silent) setAuthLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassword(passwordInput);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt) {
      setError('ENTER A PROMPT DUDE');
      return;
    }

    const storedPassword = localStorage.getItem('ragebait_password');
    if (!storedPassword) {
      setError('PASSWORD EXPIRED, REFRESH PAGE');
      return;
    }

    setLoading(true);
    setError('');
    setVideoUrl('');
    setVideoData(null);
    setProgress('');

    try {
      // Step 1: Get content from backend
      setProgress('GENERATING SCRIPT...');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: storedPassword, 
          prompt, 
          voice: selectedVoice,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          imageSource: uploadedImages.length > 0 ? undefined : imageSource // Only send if not using uploaded images
        }),
      });

      // Check for 413 error (Payload Too Large)
      if (response.status === 413) {
        throw new Error('❌ IMAGES TOO BIG');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'GENERATION FAILED');
      }

      setVideoData({ script: data.script, scenes: data.scenes });

      // Step 2: Get FFmpeg instance (already loaded)
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        throw new Error('RAGEBAIT ENGINE NOT LOADED');
      }

      // Step 3: Process images with text overlays
      setProgress('PROCESSING IMAGES...');
      const processedImages: string[] = [];
      
      for (let i = 0; i < data.scenes.length; i++) {
        setProgress(`PROCESSING IMAGE ${i + 1}/${data.scenes.length}...`);
        const scene = data.scenes[i];
        const imageUrl = data.imageUrls[i];
        
        console.log(`Processing scene ${i + 1}:`, scene.caption);
        
        // Download image and resize in browser first (to reduce memory usage)
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        
        // Draw to canvas and resize to 540x960 (smaller = less memory for FFmpeg)
        const canvas = document.createElement('canvas');
        canvas.width = 540;
        canvas.height = 960;
        const ctx = canvas.getContext('2d')!;
        
        // Calculate scaling to fill 9:16 frame
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Add text overlay directly on canvas
        const escapedText = escapeText(scene.caption);
        console.log(`Adding text: "${escapedText}"`);
        
        ctx.font = 'bold 30px Arial'; // Scaled down for 540x960
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Measure text for background box
        const textMetrics = ctx.measureText(escapedText);
        const textWidth = textMetrics.width;
        const textHeight = 40; // Approximate height (scaled down)
        const textX = canvas.width / 2;
        const textY = canvas.height / 2; // Centered vertically
        
        // Draw black background box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          textX - textWidth / 2 - 20,
          textY - textHeight / 2 - 10,
          textWidth + 40,
          textHeight + 20
        );
        
        // Draw white text (caption)
        ctx.fillStyle = 'white';
        ctx.fillText(escapedText, textX, textY);
        
        // Add subtitle at bottom if enabled
        if (enableSubtitles && data.script) {
          // Split script into segments based on scene count
          const words = data.script.split(' ');
          const wordsPerScene = Math.ceil(words.length / data.scenes.length);
          const startIndex = i * wordsPerScene;
          const endIndex = Math.min(startIndex + wordsPerScene, words.length);
          const sceneScript = words.slice(startIndex, endIndex).join(' ');
          const escapedSubtitle = escapeText(sceneScript);
          
          // Subtitle styling (smaller, at bottom)
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Split subtitle into multiple lines if too long
          const maxWidth = canvas.width - 40;
          const subtitleWords = escapedSubtitle.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          
          for (const word of subtitleWords) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          // Draw subtitle lines at bottom
          const subtitleY = canvas.height - 60;
          const lineHeight = 25;
          const totalHeight = lines.length * lineHeight;
          
          lines.forEach((line, lineIndex) => {
            const yPos = subtitleY - totalHeight / 2 + lineIndex * lineHeight;
            const subMetrics = ctx.measureText(line);
            
            // Black background for subtitle
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(
              canvas.width / 2 - subMetrics.width / 2 - 15,
              yPos - 12,
              subMetrics.width + 30,
              24
            );
            
            // White subtitle text
            ctx.fillStyle = 'white';
            ctx.fillText(line, canvas.width / 2, yPos);
          });
        }
        
        // Convert canvas to blob with lower quality to save memory
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.7);
        });
        
        // Write to FFmpeg
        const imageData = new Uint8Array(await blob.arrayBuffer());
        await ffmpeg.writeFile(`scene_${i}.jpg`, imageData);
        
        processedImages.push(`scene_${i}.jpg`);
        console.log(`✓ Scene ${i + 1} processed`);
      }

      // Step 4: Create concat file
      setProgress('COMBINING SCENES...');
      let concatContent = '';
      for (let i = 0; i < processedImages.length; i++) {
        concatContent += `file '${processedImages[i]}'\n`;
        concatContent += `duration ${data.scenes[i].duration}\n`;
      }
      concatContent += `file '${processedImages[processedImages.length - 1]}'\n`;
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      // Step 5: Process audio (compress it first to save memory)
      setProgress('ADDING AUDIO...');
      const audioData = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
      await ffmpeg.writeFile('input_audio.mp3', audioData);
      
      // Re-encode audio to AAC for iOS Safari compatibility
      console.log('Compressing audio to AAC...');
      await ffmpeg.exec([
        '-i', 'input_audio.mp3',
        '-c:a', 'aac',           // Use AAC codec (iOS compatible)
        '-b:a', '64k',
        '-ar', '22050',
        'audio.aac'
      ]);
      await ffmpeg.deleteFile('input_audio.mp3');
      console.log('✓ Audio compressed to AAC');

      // Step 6: Create final video with lower memory settings
      setProgress('CREATING VIDEO...');
      console.log('Creating final video with concat...');
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-i', 'audio.aac',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-c:a', 'aac',    // AAC codec for iOS Safari compatibility
        '-b:a', '64k',    // Maintain bitrate
        '-shortest',
        '-pix_fmt', 'yuv420p',
        'output.mp4'
      ]);
      console.log('✓ Video created successfully');

      // Step 7: Get video data
      setProgress('FINALIZING...');
      const videoData = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([new Uint8Array(videoData as Uint8Array)], { type: 'video/mp4' });
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      
      setVideoUrl(videoObjectUrl);
      setProgress('');

      // Cleanup FFmpeg virtual filesystem
      try {
        await ffmpeg.deleteFile('audio.aac');
        await ffmpeg.deleteFile('concat.txt');
        await ffmpeg.deleteFile('output.mp4');
        for (let i = 0; i < processedImages.length; i++) {
          await ffmpeg.deleteFile(processedImages[i]);
        }
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

    } catch (err) {
      console.error('Video generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'GENERATION FAILED';
      setError(errorMsg.toUpperCase());
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const escapeText = (text: string): string => {
    // Simple escape for FFmpeg drawtext - remove problematic characters
    return text
      .replace(/'/g, '')
      .replace(/:/g, ' ')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\\/g, '')
      .toUpperCase();
  };

  // Compress image to reduce upload size
  const compressImage = async (file: File): Promise<{ base64: string; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }

          // Resize to max 1080px width while maintaining aspect ratio
          const maxWidth = 1080;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 70% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64Data = compressedDataUrl.split(',')[1];
          const previewUrl = compressedDataUrl;

          console.log(`Image compressed: ${Math.round(file.size / 1024)}KB → ${Math.round(base64Data.length * 0.75 / 1024)}KB`);
          
          resolve({ base64: base64Data, previewUrl });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(''); // Clear previous errors
    
    const imageFiles = Array.from(files).slice(0, 3); // Max 3 images
    const base64Images: string[] = [];
    const previewUrls: string[] = [];

    for (const file of imageFiles) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('ONLY IMAGE FILES ALLOWED');
        return;
      }

      // Compress image
      try {
        const compressed = await compressImage(file);
        base64Images.push(compressed.base64);
        previewUrls.push(compressed.previewUrl);
      } catch (error) {
        console.error('Compression error:', error);
        setError('FAILED TO PROCESS IMAGE');
        return;
      }
    }

    setUploadedImages(base64Images);
    setImagePreviewUrls(previewUrls);
    setError('');
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleTakePhoto = async () => {
    if (uploadedImages.length >= 3) {
      setError('MAX 3 IMAGES');
      return;
    }
    
    setError(''); // Clear previous errors

    try {
      // Create a file input that only accepts camera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use back camera by default
      
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const file = target.files[0];
          
          // Compress image before uploading
          try {
            const compressed = await compressImage(file);
            setUploadedImages(prev => [...prev, compressed.base64]);
            setImagePreviewUrls(prev => [...prev, compressed.previewUrl]);
            setError(''); // Clear any previous errors
          } catch (error) {
            console.error('Camera compression error:', error);
            setError('FAILED TO PROCESS IMAGE');
          }
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Camera error:', error);
      setError('CAMERA ACCESS FAILED');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ragebait_password');
    setIsAuthenticated(false);
    setPasswordInput('');
    setPrompt('');
    setUploadedImages([]);
    setImagePreviewUrls([]);
    setVideoUrl('');
    setVideoData(null);
    setError('');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = videoData?.script || 'Check out this ragebait video!';
    
    // Native Web Share API
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        // Try to share the actual video file
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], `ragebait_${Date.now()}.mp4`, { type: 'video/mp4' });
        
        await navigator.share({
          title: 'Ragebait Video',
          text: shareText,
          files: [file]
        });
      } catch (error) {
        // Check if user just canceled (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
          // User canceled, don't show error
          return;
        }
        
        // Fallback to sharing just the URL
        try {
          await navigator.share({
            title: 'Ragebait Video',
            text: shareText,
            url: shareUrl
          });
        } catch (fallbackError) {
          // Check if user canceled again
          if (fallbackError instanceof Error && fallbackError.name === 'AbortError') {
            return;
          }
          // Actual error
          alert('❌ SHARING FAILED');
        }
      }
    } else {
      alert('❌ SHARING NOT SUPPORTED ON THIS BROWSER');
    }
  };

  // BROWSER NOT SUPPORTED SCREEN
  if (!hasSharedArrayBuffer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-black text-black mb-6 uppercase tracking-wider font-bebas">
              RAGEBAIT<br/>ANYTHING
            </h1>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>

          <div className="bg-white border-8 border-black p-8 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-black text-black mb-4 uppercase font-bebas tracking-wider">
                BROWSER NOT SUPPORTED
              </h2>
              <p className="text-black font-bold text-lg mb-4 font-bebas tracking-wide">
                THIS APP NEEDS A REAL BROWSER
              </p>
              <p className="text-black text-sm mb-6 font-bebas">
                MESSENGER INSTAGRAM FACEBOOK TIKTOK BROWSERS DON&apos;T WORK
              </p>
            </div>

            <div className="bg-black text-white p-4">
              <p className="font-black text-center text-lg font-bebas tracking-wider">
                📱 TAP ⋯ OR ⋮ MENU
              </p>
              <p className="font-black text-center text-lg font-bebas tracking-wider mb-2">
                THEN &quot;OPEN IN BROWSER&quot;
              </p>
              <p className="text-center text-sm font-bebas tracking-wider">
                OR &quot;OPEN IN CHROME&quot; / &quot;OPEN IN SAFARI&quot;
              </p>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-black font-bold font-bebas tracking-wider">SUPPORTED BROWSERS:</p>
              <div className="flex justify-center gap-4 text-3xl">
                <span title="Chrome">🔵</span>
                <span title="Safari">🧭</span>
                <span title="Firefox">🦊</span>
                <span title="Edge">🌊</span>
              </div>
              <p className="text-black text-sm font-bebas">CHROME SAFARI FIREFOX EDGE</p>
            </div>

            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(url).then(() => {
                    alert('✅ LINK COPIED! PASTE IN A REAL BROWSER');
                  }).catch(() => {
                    window.prompt('COPY THIS LINK AND OPEN IN A REAL BROWSER:', url);
                  });
                } else {
                  window.prompt('COPY THIS LINK AND OPEN IN A REAL BROWSER:', url);
                }
              }}
              className="w-full py-4 px-6 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
            >
              📋 COPY LINK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASSWORD SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-7xl font-black text-black mb-6 uppercase tracking-wider font-bebas">
              RAGEBAIT<br/>ANYTHING
            </h1>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-6 py-4 text-2xl font-bold bg-white border-4 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black uppercase font-bebas tracking-wider"
                placeholder="ENTER PASSWORD"
                disabled={authLoading}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 px-6 bg-black text-white text-2xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50 font-bebas tracking-wider"
            >
              {authLoading ? 'CHECKING...' : 'UNLOCK'}
            </button>
          </form>

          {authError && (
            <div className="mt-6 p-4 bg-black text-white text-center">
              <p className="font-black text-xl uppercase font-bebas tracking-wider">
                ❌ {authError}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GENERATOR SCREEN
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-4 border-black">
            <h1 className="text-6xl font-black text-black mb-4 uppercase tracking-wider font-bebas">
              {randomTitle}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border-2 border-black text-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-all font-bebas tracking-wider"
            >
              LOGOUT
            </button>
          </div>

          {/* Ragebait Engine Status - Only show if loading or error */}
          {(engineLoading || engineError) && (
            <div className="bg-white border-8 border-black p-8 mb-8">
              <h2 className="text-black font-black mb-4 text-2xl uppercase font-bebas tracking-wider text-center">
                🔥 RAGEBAIT ENGINE
              </h2>
              
              {engineLoading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4"></div>
                  <p className="text-black font-bold text-lg font-bebas tracking-wider">
                    LOADING ENGINE...
                  </p>
                </div>
              )}
              
              {engineError && (
                <div className="space-y-4">
                  <div className="bg-black text-white p-4 text-center">
                    <p className="font-black text-lg font-bebas tracking-wider">
                      ❌ {engineError}
                    </p>
                  </div>
                  <button
                    onClick={loadRagebaitEngine}
                    className="w-full py-4 px-6 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                  >
                    🔄 RETRY
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Form - Show when engine is loaded */}
          {engineLoaded && (
            <>
            {/* Engine Status Badge */}
            <div className="bg-black text-white p-3 mb-6 text-center border-4 border-black">
              <p className="font-black text-sm font-bebas tracking-wider">
                ✅ RAGEBAIT ENGINE LOADED
              </p>
            </div>
            
            {/* Form */}
            <div className="bg-white border-8 border-black p-8 mb-8">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-black font-black mb-3 text-2xl uppercase font-bebas tracking-wider">
                    YOUR TARGET:
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-4 border-black text-black text-lg font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black resize-none font-bebas tracking-wider"
                    placeholder="WHY YOUR PHONE BATTERY DIES AT 20%..."
                    disabled={loading}
                  />
                </div>

                {/* Image Source Toggle (only show when no images uploaded) */}
                {uploadedImages.length === 0 && (
                  <div className="border-4 border-black p-4 bg-white">
                    <label className="block text-black font-black mb-3 text-lg uppercase font-bebas tracking-wider">
                      🖼️ IMAGE SOURCE:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setImageSource('pexels')}
                        className={`py-3 px-4 font-black text-sm uppercase border-4 border-black transition-all font-bebas tracking-wider ${
                          imageSource === 'pexels'
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                        disabled={loading}
                      >
                        PEXELS
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSource('imgur')}
                        className={`py-3 px-4 font-black text-sm uppercase border-4 border-black transition-all font-bebas tracking-wider ${
                          imageSource === 'imgur'
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                        disabled={loading}
                      >
                        IMGUR
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsible Image Upload Section */}
                <div className="border-4 border-black">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="w-full px-4 py-3 bg-black text-white font-black text-xl uppercase font-bebas tracking-wider flex items-center justify-between hover:bg-gray-800 transition-all"
                  >
                    <span>📸 UPLOAD IMAGES {uploadedImages.length > 0 && `(${uploadedImages.length})`}</span>
                    <span className="text-2xl">{showImageUpload ? '▼' : '▶'}</span>
                  </button>
                  
                  {showImageUpload && (
                    <div className="p-4 bg-white">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <label
                          htmlFor="images"
                          className="block w-full px-4 py-3 bg-white border-4 border-black text-black text-center font-bold cursor-pointer hover:bg-black hover:text-white transition-all font-bebas tracking-wider"
                        >
                          📁 UPLOAD
                        </label>
                        
                        <button
                          type="button"
                          onClick={handleTakePhoto}
                          disabled={loading || uploadedImages.length >= 3}
                          className="w-full px-4 py-3 bg-white border-4 border-black text-black text-center font-bold cursor-pointer hover:bg-black hover:text-white transition-all font-bebas tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          📷 TAKE PHOTO
                        </button>
                      </div>
                      
                      <div className="text-center text-sm font-bold font-bebas tracking-wider mb-3">
                        {uploadedImages.length > 0 
                          ? `${uploadedImages.length} IMAGE${uploadedImages.length > 1 ? 'S' : ''} ADDED` 
                          : 'MAX 3 IMAGES'}
                      </div>
                      
                      {error && (
                        <div className="mb-3 p-3 bg-red-600 text-white border-4 border-black">
                          <p className="font-black text-sm uppercase text-center font-bebas tracking-wider">
                            ❌ {error}
                          </p>
                        </div>
                      )}
                      
                      {imagePreviewUrls.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative border-4 border-black">
                              <img 
                                src={url} 
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-xs font-bold hover:bg-red-600 font-bebas"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible Voice Personality Section */}
                <div className="border-4 border-black">
                  <button
                    type="button"
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="w-full px-4 py-3 bg-black text-white font-black text-xl uppercase font-bebas tracking-wider flex items-center justify-between hover:bg-gray-800 transition-all"
                  >
                    <span>🎤 VOICE: {selectedVoice === 'elli' ? 'UNHINGED & EMOTIONAL' : selectedVoice.toUpperCase()}</span>
                    <span className="text-2xl">{showVoiceSelector ? '▼' : '▶'}</span>
                  </button>
                  
                  {showVoiceSelector && (
                    <div className="p-4 bg-white">
                      <select
                        id="voice"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-4 border-black text-black text-lg font-bold focus:outline-none focus:ring-4 focus:ring-black font-bebas tracking-wider cursor-pointer"
                        disabled={loading}
                      >
                        <optgroup label="😤 MAXIMUM RAGE">
                          <option value="elli">UNHINGED & EMOTIONAL ⭐ (Default)</option>
                          <option value="charlotte">CONDESCENDING & SEDUCTIVE</option>
                          <option value="adam">ALPHA MALE ENERGY</option>
                        </optgroup>
                        <optgroup label="🤬 ANNOYING AF">
                          <option value="rachel">VALLEY GIRL ENERGY</option>
                          <option value="bella">ASMR WHISPER CREEP</option>
                          <option value="antoni">SMUG KNOW-IT-ALL</option>
                        </optgroup>
                        <optgroup label="😏 PASSIVE AGGRESSIVE">
                          <option value="josh">DEEP VOICE MANSPLAINER</option>
                          <option value="dorothy">BRITISH KAREN</option>
                        </optgroup>
                      </select>
                    </div>
                  )}
                </div>

                {/* Subtitle Checkbox */}
                <div className="border-4 border-black p-4 bg-black">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white font-black text-xl uppercase font-bebas tracking-wider">
                      📝 ADD SUBTITLES
                    </span>
                    <input
                      type="checkbox"
                      checked={enableSubtitles}
                      onChange={(e) => setEnableSubtitles(e.target.checked)}
                      className="w-6 h-6 border-2 border-white bg-white cursor-pointer accent-white"
                      disabled={loading}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 px-6 bg-black text-white text-2xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50 font-bebas tracking-wider"
                >
                  {loading ? (progress || '⏳ GENERATING...') : '🔥 GENERATE VIDEO'}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-black text-white border-4 border-black">
                  <p className="font-black text-lg uppercase text-center font-bebas tracking-wider">
                    ❌ {error}
                  </p>
                </div>
              )}

              {videoUrl && (
              <div className="mt-8 space-y-6">
                <div className="bg-black text-white p-4 border-4 border-black">
                  <p className="font-black text-xl uppercase text-center font-bebas tracking-wider">
                    ✅ VIDEO READY!
                  </p>
                </div>

                {/* Video Player */}
                <div className="border-8 border-black bg-black">
                  <video
                    controls
                    className="w-full max-h-[600px] mx-auto"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Video Info */}
                {videoData && (
                  <div className="border-4 border-black p-6 bg-white">
                    <h3 className="text-black font-black mb-3 text-xl uppercase font-bebas tracking-wider">
                      SCRIPT:
                    </h3>
                    <p className="text-black mb-6 font-bold text-lg font-bebas tracking-wide">
                      &ldquo;{videoData.script}&rdquo;
                    </p>
                    
                    <h3 className="text-black font-black mb-3 text-xl uppercase font-bebas tracking-wider">
                      SCENES:
                    </h3>
                    <ul className="space-y-2">
                      {videoData.scenes.map((scene, idx) => (
                        <li key={idx} className="text-black font-bold uppercase text-sm border-l-4 border-black pl-3 font-bebas tracking-wider">
                          SCENE {idx + 1}: {scene.caption} ({scene.duration}S)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Download Button */}
                <a
                  href={videoUrl}
                  download={`ragebait_${Date.now()}.mp4`}
                  className="block w-full py-4 px-6 bg-black text-white font-black text-xl text-center uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                >
                  💾 DOWNLOAD VIDEO
                </a>

                {/* Share Section */}
                <div className="border-4 border-black p-6 bg-white">
                  <h3 className="text-black font-black mb-4 text-xl uppercase font-bebas tracking-wider text-center">
                    📤 SHARE TO...
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR COWORKER
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR WIFE
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR MOM
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR DAD
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      A HOMELESS
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR FRAT BRO
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      A BOOMER
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR EX
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR GRANDMA
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOUR LANDLORD
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      YOURSELF
                    </button>
                    <button
                      onClick={() => handleShare()}
                      className="py-3 px-4 bg-black text-white font-black text-sm uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                    >
                      A KAREN
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center border-4 border-black p-4 bg-white">
            <p className="text-black font-black uppercase text-sm font-bebas tracking-wider">
              ⚠️ USE RESPONSIBLY ⚠️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
