import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { SUBSCRIPTION_PLANS } from '../../core/models/subscription.model';

import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, LucideAngularModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);

  isRenewing = false;
  isLoading = false;
  selectedPlan: any = null;
  plans = SUBSCRIPTION_PLANS;

  isMobileMenuOpen = false;
  currentRole = 'Admin';
  pageTitle = 'Dashboard';

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      }
    });

    this.updateLayoutState(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateLayoutState(event.urlAfterRedirects);
    });
  }

  updateLayoutState(url: string) {
    if (url.includes('agenda')) this.pageTitle = 'My Agenda';
    else if (url.includes('book-appointment') || url.includes('book-session')) this.pageTitle = 'Book Appointment';
    else if (url.includes('patients')) this.pageTitle = 'Patients Directory';
    else if (url.includes('doctors')) this.pageTitle = 'Doctors Directory';
    else if (url.includes('lab-services')) this.pageTitle = 'Lab Services';
    else if (url.includes('sessions')) this.pageTitle = 'My Sessions';
    else if (url.includes('lab-technicians')) this.pageTitle = 'Lab Technicians';
    else if (url.includes('profile')) this.pageTitle = 'My Profile';
    else this.pageTitle = 'Dashboard';
  }

  get subscription() {
    return (this.authService.currentUser as any)?.subscription;
  }

  get userRole() {
    return this.authService.currentUser?.role;
  }

  get daysRemaining(): number {
    if (!this.subscription?.expiryDate) return 100; // Default safe for admin/other
    const expiry = this.subscription.expiryDate;
    const date = (expiry as any).toDate ? (expiry as any).toDate() : new Date(expiry);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  get isPlanExpired(): boolean {
    if (this.userRole === 'admin' || this.userRole === 'patient') return false;
    if (!this.subscription) return false;
    return this.subscription.status === 'expired' || this.daysRemaining <= 0;
  }

  get isPlanExpiringSoon(): boolean {
    if (this.isPlanExpired) return false;
    return this.daysRemaining <= 5;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  async renewPlan() {
    this.isRenewing = true;
  }

  selectPlan(plan: any) {
    this.selectedPlan = plan;
  }

  async processRenewal() {
    if (!this.selectedPlan) return;
    this.isLoading = true;

    try {
        const order = await this.paymentService.createOrder(this.selectedPlan.type, this.selectedPlan.price);
        const paymentSuccess = await this.paymentService.verifyPayment(order.orderId, { status: 'success' });
        
        if (paymentSuccess) {
            const currentUser = this.authService.currentUser;
            if (currentUser) {
                const expiryDate = this.paymentService.calculateExpiryDate(this.selectedPlan.type);
                
                await this.paymentService.saveTransaction({
                    userId: currentUser.uid,
                    userType: currentUser.role as any,
                    planType: this.selectedPlan.type,
                    amount: this.selectedPlan.price,
                    paymentStatus: 'success',
                    txnId: `txn_renew_${Date.now()}`,
                    expiryDate: expiryDate
                });

                await this.authService.updateProfile(currentUser.uid, {
                    subscription: {
                        plan: this.selectedPlan.type,
                        startDate: new Date(),
                        expiryDate: expiryDate,
                        status: 'active'
                    }
                });

                this.isRenewing = false;
                this.selectedPlan = null;
            }
        }
    } catch (err) {
        console.error('Renewal failed', err);
    } finally {
        this.isLoading = false;
    }
  }
}

