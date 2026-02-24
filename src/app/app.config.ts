import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  LucideAngularModule,
  Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
  ArrowRight, Clock, ChevronRight, Menu, X, Filter, Search, Plus, Moon, Sun, PlaySquare, CheckCircle2, ActivitySquare, MoreHorizontal, Star,
  User, FileText, Settings, Camera, RefreshCw, Fingerprint, Trash2, Edit2
} from 'lucide-angular';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(LucideAngularModule.pick({
      Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
      ArrowRight, Clock, ChevronRight, Menu, X, Filter, Search, Plus, Moon, Sun, PlaySquare, CheckCircle2, ActivitySquare, MoreHorizontal, Star, User,
      FileText, Settings, Camera, RefreshCw, Fingerprint, Trash2, Edit2
    }))
  ]
};
