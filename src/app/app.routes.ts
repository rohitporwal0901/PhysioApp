import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // Public landing page
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
    },
    // Doctor public profile (accessible without login)
    {
        path: 'doctor-profile/:id',
        loadComponent: () => import('./features/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent)
    },
    // Patient Registration (public)
    {
        path: 'patient/register',
        loadComponent: () => import('./features/patient/register/register.component').then(m => m.PatientRegisterComponent)
    },
    // Doctor Registration (public)
    {
        path: 'doctor/register',
        loadComponent: () => import('./features/doctor/register/doctor-register.component').then(m => m.DoctorRegisterComponent)
    },
    // Login
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    // ── Protected App Routes ──
    {
        path: '',
        loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
            // Admin routes
            {
                path: 'admin/dashboard',
                canActivate: [roleGuard(['admin'])],
                loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'admin/doctors',
                canActivate: [roleGuard(['admin'])],
                loadComponent: () => import('./features/admin/doctors/doctors.component').then(m => m.DoctorsComponent)
            },
            {
                path: 'admin/patients',
                canActivate: [roleGuard(['admin'])],
                loadComponent: () => import('./features/admin/patients/patients.component').then(m => m.PatientsComponent)
            },
            {
                path: 'admin/lab-technicians',
                canActivate: [roleGuard(['admin'])],
                loadComponent: () => import('./features/admin/lab-technicians/lab-technicians.component').then(m => m.LabTechniciansComponent)
            },
            {
                path: 'admin/video-settings',
                canActivate: [roleGuard(['admin'])],
                loadComponent: () => import('./features/admin/video-settings/video-settings.component').then(m => m.VideoSettingsComponent)
            },
            // Doctor routes
            {
                path: 'doctor/dashboard',
                canActivate: [roleGuard(['doctor'])],
                loadComponent: () => import('./features/doctor/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'doctor/agenda',
                canActivate: [roleGuard(['doctor'])],
                loadComponent: () => import('./features/doctor/agenda/agenda.component').then(m => m.AgendaComponent)
            },
            {
                path: 'doctor/patients',
                canActivate: [roleGuard(['doctor'])],
                loadComponent: () => import('./features/doctor/patients/patients.component').then(m => m.PatientsComponent)
            },
            {
                path: 'doctor/profile',
                canActivate: [roleGuard(['doctor'])],
                loadComponent: () => import('./features/doctor/profile/profile.component').then(m => m.ProfileComponent)
            },
            // Patient routes
            {
                path: 'patient/dashboard',
                canActivate: [roleGuard(['patient'])],
                loadComponent: () => import('./features/patient/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'patient/book-appointment',
                canActivate: [roleGuard(['patient'])],
                loadComponent: () => import('./features/patient/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
            },
            {
                path: 'patient/sessions',
                canActivate: [roleGuard(['patient'])],
                loadComponent: () => import('./features/patient/my-sessions/my-sessions.component').then(m => m.MySessionsComponent)
            },
            {
                path: 'patient/lab-services',
                canActivate: [roleGuard(['patient'])],
                loadComponent: () => import('./features/patient/lab-services/lab-services.component').then(m => m.LabServicesComponent)
            },
            {
                path: 'patient/profile',
                canActivate: [roleGuard(['patient'])],
                loadComponent: () => import('./features/patient/profile/profile.component').then(m => m.ProfileComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
