interface GrokImageRequest {
  prompt: string;
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'high';
  style?: 'photographic' | 'digital_art' | 'cinematic' | 'anime' | 'oil_painting' | 'watercolor';
}

interface GrokVideoRequest {
  image_urls?: string[];
  prompt: string;
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  mode?: 'normal' | 'fun' | 'custom' | 'spicy';
  duration?: 3 | 6;
}

interface GrokUpscaleRequest {
  image_url: string;
  scale_factor?: 2 | 4;
  enhance_quality?: boolean;
}

interface GrokApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  credits_used?: number;
  processing_time?: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspect_ratio: string;
  created_at: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail_url: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
  created_at: string;
}

class GrokApiClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.kie.ai/grok-imagine';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    method: 'POST' | 'GET' = 'POST'
  ): Promise<GrokApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
        credits_used: result.credits_used,
        processing_time: result.processing_time,
      };
    } catch (error) {
      console.error('Grok API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateImage(request: GrokImageRequest): Promise<GrokApiResponse<GeneratedImage>> {
    const payload = {
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio || '16:9',
      quality: request.quality || 'high',
      style: request.style || 'photographic',
    };

    return this.makeRequest<GeneratedImage>('/text-to-image', payload);
  }

  async generateVideo(request: GrokVideoRequest): Promise<GrokApiResponse<GeneratedVideo>> {
    const payload = {
      ...(request.image_urls && { image_urls: request.image_urls }),
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio || '16:9',
      mode: request.mode || 'normal',
      duration: request.duration || 6,
    };

    const endpoint = request.image_urls ? '/image-to-video' : '/text-to-video';
    return this.makeRequest<GeneratedVideo>(endpoint, payload);
  }

  async upscaleImage(request: GrokUpscaleRequest): Promise<GrokApiResponse<GeneratedImage>> {
    const payload = {
      image_url: request.image_url,
      scale_factor: request.scale_factor || 2,
      enhance_quality: request.enhance_quality !== false,
    };

    return this.makeRequest<GeneratedImage>('/upscale', payload);
  }

  async getUsageStats(): Promise<GrokApiResponse<{
    total_credits_used: number;
    remaining_credits: number;
    current_period_usage: number;
  }>> {
    return this.makeRequest('/usage', {}, 'GET');
  }
}

// Server-side client (using environment variable)
export function createGrokClient(): GrokApiClient {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROK_API_KEY environment variable is required');
  }
  
  return new GrokApiClient(apiKey);
}

// Client-side hook for usage tracking and state management
export function useGrokApi() {
  const generateImage = async (request: GrokImageRequest) => {
    const response = await fetch('/api/grok/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    return response.json();
  };

  const generateVideo = async (request: GrokVideoRequest) => {
    const response = await fetch('/api/grok/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    return response.json();
  };

  const upscaleImage = async (request: GrokUpscaleRequest) => {
    const response = await fetch('/api/grok/upscale-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    return response.json();
  };

  const getUsageStats = async () => {
    const response = await fetch('/api/grok/usage');
    return response.json();
  };

  return {
    generateImage,
    generateVideo,
    upscaleImage,
    getUsageStats,
  };
}

export type {
  GrokImageRequest,
  GrokVideoRequest,
  GrokUpscaleRequest,
  GrokApiResponse,
  GeneratedImage,
  GeneratedVideo,
};