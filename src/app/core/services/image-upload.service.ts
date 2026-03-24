import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private storage = inject(Storage);

  /**
   * Uploads an image to Firebase Storage and returns the download URL.
   * @param file The file to upload
   * @param path The path in storage (e.g., 'profiles/doctors/uid.jpg')
   */
  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB for profile pics

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG and WEBP are allowed.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 2MB.' };
    }
    return { valid: true };
  }

  /**
   * Uploads a document (PDF) to Firebase Storage and returns the download URL.
   * @param file The file to upload
   * @param path The path in storage (e.g., 'documents/labs/uid.pdf')
   */
  async uploadDocument(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  validateDocument(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB for PDF documents

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF documents are allowed.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB.' };
    }
    return { valid: true };
  }
}
