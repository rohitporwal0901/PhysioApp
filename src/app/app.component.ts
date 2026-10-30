import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'healthhub-app';

  constructor(private location: Location) {}

  ngOnInit() {
    this.handleHardwareBackButton();
  }

  private handleHardwareBackButton() {
    // Standard back button handling for Capacitor APKs
    App.addListener('backButton', (data: any) => {
      if (data.canGoBack) {
        this.location.back();
      } else {
        App.exitApp();
      }
    });
  }
}
