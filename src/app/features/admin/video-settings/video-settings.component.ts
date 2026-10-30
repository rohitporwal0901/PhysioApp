import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SafePipe } from '../../../shared/pipes/safe.pipe';
import { SettingsService, AppSettings } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-video-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SafePipe],
  templateUrl: './video-settings.component.html',
  styleUrl: './video-settings.component.scss'
})
export class VideoSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);

  videoUrl: string = '';
  isActive: boolean = true;
  isLoading: boolean = false;
  currentSettings: AppSettings | null = null;

  ngOnInit() {
    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.currentSettings = settings;
        this.videoUrl = settings.heroVideo.url;
        this.isActive = settings.heroVideo.isActive;
      }
    });
  }

  get previewId(): string | null {
    return this.settingsService.extractVideoId(this.videoUrl);
  }

  async onSave() {
    if (!this.videoUrl && this.isActive) {
      this.toastService.show('Please enter a YouTube URL if you want to activate it', 'error');
      return;
    }

    if (this.videoUrl) {
      const videoId = this.settingsService.extractVideoId(this.videoUrl);
      if (!videoId) {
        this.toastService.show('Invalid YouTube URL format', 'error');
        return;
      }
    }

    this.isLoading = true;
    try {
      await this.settingsService.updateHeroVideo(this.videoUrl, this.isActive);
      this.toastService.show('Hero video updated successfully', 'success');
    } catch (error: any) {
      this.toastService.show(error.message || 'Failed to update settings', 'error');
    } finally {
      this.isLoading = false;
    }
  }
}
