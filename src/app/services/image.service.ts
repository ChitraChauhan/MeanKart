import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private blobUrls: Map<string, string> = new Map();

  getImagePreview(image: File | string): string {
    if (!image) return '';

    // For file objects
    if (image instanceof File) {
      const key = `${image.name}-${image.size}-${image.lastModified}`;
      if (!this.blobUrls.has(key)) {
        const blobUrl = URL.createObjectURL(image);
        this.blobUrls.set(key, blobUrl);
      }
      return this.blobUrls.get(key) || '';
    }
    // For string URLs
    else if (typeof image === 'string') {
      // If it's a relative URL, prepend the API URL
      if (image.startsWith('/') && !image.startsWith('//')) {
        return environment.apiUrl + image;
      }
      return image;
    }
    return '';
  }
}
