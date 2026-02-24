import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  LucideAngularModule,
  Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
  ArrowRight, Clock, ChevronRight, Menu, X, Filter, Search, Plus, Moon, Sun, PlaySquare, CheckCircle2, ActivitySquare
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(LucideAngularModule.pick({
      Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
      ArrowRight, Clock, ChevronRight, Menu, X, Filter, Search, Plus, Moon, Sun, PlaySquare, CheckCircle2, ActivitySquare
    }))
  ]
};
