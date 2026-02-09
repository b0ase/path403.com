// Google AI / Gemini API Client for Nano Banana Video Generation (Veo)

export interface NanoBananaVideoRequest {
  prompt: string;
  duration?: 3 | 6; // seconds
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail_url: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
  created_at: string;
}

export interface GoogleAIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  processing_time?: number;
}

class GoogleAIClient {
  private apiKey: string;
  // Using the new Vertex AI / Gemini endpoint structure for video
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_PRO_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    if (!this.apiKey) {
      console.warn('🍌 Nano Banana: No Google AI API key found. Using mock mode.');
    }
    // Removed API key logging for security
  }

  /**
   * Generate video using Veo 3.0 or fallbacks
   */
  async generateVideo(request: NanoBananaVideoRequest): Promise<GoogleAIResponse<GeneratedVideo>> {
    const startTime = Date.now();
    try {
      console.log(`🍌 Nano Banana: Working on prompt: ${request.prompt}`);

      if (!this.apiKey) {
        return this.generateMockVideo(request, startTime);
      }

      // 1. Try Veo 3.0 (predictLongRunning)
      try {
        console.log('🍌 Trying Veo 3.0 (predictLongRunning)...');
        const veoEndpoint = `${this.baseUrl}/models/veo-3.0-generate-001:predictLongRunning?key=${this.apiKey}`;
        const veoRes = await fetch(veoEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instances: [{ prompt: request.prompt }] }),
        });

        if (veoRes.ok) {
          const operation = await veoRes.json();
          const operationName = operation.name;
          if (operationName) {
            // Polling logic
            let attempts = 0;
            while (attempts < 20) { // 60s max
              await new Promise(r => setTimeout(r, 3000));
              attempts++;
              const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${this.apiKey}`);
              const pollResult = await pollRes.json();
              if (pollResult.done) {
                if (pollResult.error) throw new Error(pollResult.error.message);
                const videoUrl = pollResult.response?.outputs?.[0]?.videoMetadata?.videoUri;
                if (videoUrl) {
                  return {
                    success: true,
                    data: {
                      id: `v-${Date.now()}`,
                      url: videoUrl,
                      thumbnail_url: '',
                      prompt: request.prompt,
                      duration: request.duration || 6,
                      aspect_ratio: request.aspectRatio || '9:16',
                      created_at: new Date().toISOString(),
                    },
                    processing_time: Date.now() - startTime,
                  };
                }
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('🍌 Veo 3.0 failed, rotating to fallbacks...', e);
      }

      // 2. Fallbacks (generateContent)
      const fallbackModels = [
        'nano-banana-pro-preview',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      for (const model of fallbackModels) {
        try {
          console.log(`🍌 Trying fallback model: ${model}...`);
          const endpoint = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `[VIDEO GENERATION] Prompt: ${request.prompt}` }] }]
            }),
          });

          if (res.ok) {
            const result = await res.json();
            const part = result.candidates?.[0]?.content?.parts?.[0];
            let videoUrl = part?.videoMetadata?.videoUri || part?.fileData?.fileUri;

            if (!videoUrl && part?.text) {
              const urlMatch = part.text.match(/https?:\/\/\S+\.(mp4|webm|mov)/);
              if (urlMatch) videoUrl = urlMatch[0];
            }

            if (videoUrl) {
              return {
                success: true,
                data: {
                  id: `v-${Date.now()}`,
                  url: videoUrl,
                  thumbnail_url: '',
                  prompt: request.prompt,
                  duration: request.duration || 6,
                  aspect_ratio: request.aspectRatio || '9:16',
                  created_at: new Date().toISOString(),
                },
                processing_time: Date.now() - startTime,
              };
            }
          }
        } catch (e) {
          // Continue to next model
        }
      }

      throw new Error('All models including Veo 3.0 and fallbacks failed.');

    } catch (error: any) {
      console.error('🍌 Nano Banana Global Failure:', error);
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockVideo(request, startTime);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Mock generation for development/testing when API access is limited
   */
  private async generateMockVideo(
    request: NanoBananaVideoRequest,
    startTime: number
  ): Promise<GoogleAIResponse<GeneratedVideo>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a sample video URL (using reliable placeholder sources)
    const mockVideos = [
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      // Since user requests vertical videos often, let's try to find something suitable or just standard clips
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ];

    const randomVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)];

    return {
      success: true,
      data: {
        id: `mock-${Date.now()}`,
        url: randomVideo,
        thumbnail_url: '',
        prompt: request.prompt,
        duration: request.duration || 6,
        aspect_ratio: request.aspectRatio || '9:16',
        created_at: new Date().toISOString(),
      },
      processing_time: Date.now() - startTime,
    };
  }
}

// Export singleton instance
let googleAIClient: GoogleAIClient | null = null;

export function getGoogleAIClient(): GoogleAIClient {
  if (!googleAIClient) {
    googleAIClient = new GoogleAIClient();
  }
  return googleAIClient;
}

export default GoogleAIClient;
