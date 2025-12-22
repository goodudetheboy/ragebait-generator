'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoData, setVideoData] = useState<{
    script: string;
    scenes: Array<{ caption: string; duration: number; keywords: string }>;
  } | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedPassword = localStorage.getItem('ragebait_password');
    if (storedPassword) {
      // Verify stored password is still valid
      verifyPassword(storedPassword, true);
    }
  }, []);

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

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: storedPassword, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'VIDEO GENERATION FAILED');
      }

      setVideoUrl(data.videoUrl);
      setVideoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GENERATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ragebait_password');
    setIsAuthenticated(false);
    setPasswordInput('');
    setPrompt('');
    setVideoUrl('');
    setVideoData(null);
    setError('');
  };

  // PASSWORD SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-7xl font-black text-black mb-6 uppercase tracking-wider font-bebas">
              RAGEBAIT<br/>GENERATOR
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
              RAGEBAIT GENERATOR
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border-2 border-black text-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-all font-bebas tracking-wider"
            >
              LOGOUT
            </button>
          </div>

          {/* Main Form */}
          <div className="bg-white border-8 border-black p-8 mb-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-black font-black mb-3 text-2xl uppercase font-bebas tracking-wider">
                  YOUR PROMPT:
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-6 bg-black text-white text-2xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50 font-bebas tracking-wider"
              >
                {loading ? '⏳ GENERATING... (2-3 MIN)' : '🔥 GENERATE VIDEO'}
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
                  download
                  className="block w-full py-4 px-6 bg-black text-white font-black text-xl text-center uppercase border-4 border-black hover:bg-white hover:text-black transition-all font-bebas tracking-wider"
                >
                  💾 DOWNLOAD VIDEO
                </a>
              </div>
            )}
          </div>

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
