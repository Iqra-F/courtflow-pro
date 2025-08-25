// File storage abstraction for easy switching between local and S3

export interface FileStorage {
  upload(file: File, path: string): Promise<{ url: string; key: string }>;
  download(key: string): Promise<Blob>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// Local storage implementation (for development)
export class LocalFileStorage implements FileStorage {
  private baseUrl = '/api/files';

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return {
      url: result.url,
      key: result.key,
    };
  }

  async download(key: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/download/${key}`);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    return response.blob();
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete/${key}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Delete failed');
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/view/${key}`;
  }
}

// S3 storage implementation (for production)
export class S3FileStorage implements FileStorage {
  private bucket: string;
  private region: string;

  constructor(bucket: string, region: string) {
    this.bucket = bucket;
    this.region = region;
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    // Implementation would use AWS SDK
    throw new Error('S3 storage not implemented yet');
  }

  async download(key: string): Promise<Blob> {
    throw new Error('S3 storage not implemented yet');
  }

  async delete(key: string): Promise<void> {
    throw new Error('S3 storage not implemented yet');
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// Factory function to get the appropriate storage implementation
export function getFileStorage(): FileStorage {
  // For now, use local storage. In production, switch to S3
  return new LocalFileStorage();
}

// File validation utilities
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png',
  'image/jpeg',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload PDF, DOCX, PNG, or JPG files.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 25MB.',
    };
  }

  return { valid: true };
}

// Placeholder for virus scanning
export async function scanFile(file: File): Promise<{ safe: boolean; reason?: string }> {
  // In production, integrate with a virus scanning service
  // For now, just return safe
  return { safe: true };
}