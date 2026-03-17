import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

export interface AppSettings {
  heroVideo: {
    url: string;
    isActive: boolean;
    videoId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private firestore = inject(Firestore);
  private settingsDoc = doc(this.firestore, 'settings', 'global');

  private settingsSubject = new BehaviorSubject<AppSettings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.listenToSettings();
  }

  private listenToSettings() {
    onSnapshot(this.settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        this.settingsSubject.next(snapshot.data() as AppSettings);
      } else {
        // Initialize if not exists
        const defaultSettings: AppSettings = {
          heroVideo: {
            url: 'https://www.youtube.com/watch?v=aO1boUJhjvk',
            isActive: true,
            videoId: 'aO1boUJhjvk'
          }
        };
        this.updateHeroVideo(defaultSettings.heroVideo.url, true);
      }
    });
  }

  async updateHeroVideo(url: string, isActive: boolean): Promise<void> {
    const videoId = this.extractVideoId(url);
    if (!videoId && url !== '') throw new Error('Invalid YouTube URL');

    await setDoc(this.settingsDoc, {
      heroVideo: {
        url,
        isActive,
        videoId: videoId || ''
      }
    }, { merge: true });
  }

  extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
