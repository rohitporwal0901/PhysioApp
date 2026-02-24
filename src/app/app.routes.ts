import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'admin/dashboard',
                loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'admin/doctors',
                loadComponent: () => import('./features/admin/doctors/doctors.component').then(m => m.DoctorsComponent)
            },
            {
                path: 'admin/patients',
                loadComponent: () => import('./features/admin/patients/patients.component').then(m => m.PatientsComponent)
            },
            {
                path: 'doctor/dashboard',
                loadComponent: () => import('./features/doctor/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'doctor/agenda',
                loadComponent: () => import('./features/doctor/agenda/agenda.component').then(m => m.AgendaComponent)
            },
            {
                path: 'doctor/patients',
                loadComponent: () => import('./features/doctor/patients/patients.component').then(m => m.PatientsComponent)
            },
            {
                path: 'patient/dashboard',
                loadComponent: () => import('./features/patient/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'patient/book-appointment',
                loadComponent: () => import('./features/patient/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
            },
            {
                path: 'patient/sessions',
                loadComponent: () => import('./features/patient/my-sessions/my-sessions.component').then(m => m.MySessionsComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
