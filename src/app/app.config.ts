import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  LucideAngularModule,
  Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
  ArrowRight, ArrowLeft, ArrowUp, Clock, ChevronRight, ChevronDown, Menu, X, Filter, Search, Plus, Moon, Sun,
  PlaySquare, PlayCircle, CheckCircle2, ActivitySquare, MoreHorizontal, Star, User,
  FileText, Settings, Camera, RefreshCw, Fingerprint, Trash2, Edit2,
  Heart, Zap, Shield, MapPin, Phone, PhoneCall, GraduationCap, Award,
  ClipboardList, HeartPulse, CalendarCheck, CalendarPlus,
  ChevronLeft, UserCheck, CheckCircle, ClipboardCheck, Eye, EyeOff,
  ShieldCheck, MessageCircle, Facebook, Twitter, Instagram, Youtube,
  TrendingUp, HelpCircle, ListOrdered, Stethoscope, Bone,
  LockKeyhole, AlertCircle, Check, Linkedin, Send, LogOut, Sparkles, MessageSquare, Loader,
  Accessibility, Footprints, Brain, Cpu, Map, Microscope, Info, AlertTriangle,
  SearchX, Briefcase, ExternalLink, IndianRupee, Share, Share2
} from 'lucide-angular';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
    provideFunctions(() => getFunctions()),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(LucideAngularModule.pick({
      Activity, Mail, Lock, LayoutDashboard, Users, UserPlus, Calendar,
      ArrowRight, ArrowLeft, ArrowUp, Clock, ChevronRight, ChevronDown, Menu, X, Filter, Search, Plus, Moon, Sun,
      PlaySquare, PlayCircle, CheckCircle2, ActivitySquare, MoreHorizontal, Star, User,
      FileText, Settings, Camera, RefreshCw, Fingerprint, Trash2, Edit2,
      Heart, Zap, Shield, MapPin, Phone, PhoneCall, GraduationCap, Award,
      ClipboardList, HeartPulse, CalendarCheck, CalendarPlus,
      ChevronLeft, UserCheck, CheckCircle, ClipboardCheck, Eye, EyeOff,
      ShieldCheck, MessageCircle, Facebook, Twitter, Instagram, Youtube,
      TrendingUp, HelpCircle, ListOrdered, Stethoscope, Bone,
      LockKeyhole, AlertCircle, Check, Linkedin, Send, LogOut, Sparkles, MessageSquare, Loader,
      Accessibility, Footprints, Brain, Cpu, Map, Microscope, Info, AlertTriangle,
      SearchX, Briefcase, ExternalLink, IndianRupee, Share, Share2
    }))
  ]
};
