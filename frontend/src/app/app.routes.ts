import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CandidatesComponent } from './pages/candidates/candidates.component';
import { LoginComponent } from './pages/login/login.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'candidates', component: CandidatesComponent },
            { path: 'jobs', component: JobsComponent },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
