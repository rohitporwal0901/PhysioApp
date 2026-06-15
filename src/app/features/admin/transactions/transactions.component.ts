import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, onSnapshot, query, orderBy } from '@angular/fire/firestore';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

type Period = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom';
type BookingFilter = 'all' | 'appointment' | 'subscription';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatCardComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private api = inject(MockApiService);

  // ── State ──────────────────────────────────────────────
  isLoading = signal(true);
  allTransactions = signal<any[]>([]);
  doctors = signal<any[]>([]);

  // ── Filters ────────────────────────────────────────────
  transactionPeriod = signal<Period>('today');
  customStartDate = signal('');
  customEndDate = signal('');
  showCustomDateRange = signal(false);
  customDateError = signal('');
  bookingTypeFilter = signal<BookingFilter>('all');
  selectedDoctorId = signal('');

  // ── Computed: date range ────────────────────────────────
  currentDateRange = computed(() => this.getDateRangeForPeriod(this.transactionPeriod()));

  filterAppliedLabel = computed(() => {
    const { startDate, endDate } = this.currentDateRange();
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (startDate.toDateString() === endDate.toDateString()) return fmt(startDate);
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  });

  // ── Computed: filtered list ─────────────────────────────
  filteredTransactions = computed(() => {
    const role = this.authService.currentUser?.role;
    const uid = this.authService.currentUser?.uid ?? '';
    const { startDate, endDate } = this.currentDateRange();
    let list = this.allTransactions();

    // Role filter
    if (role === 'doctor') {
      list = list.filter(t => t.doctorId === uid);
    } else if (role === 'lab') {
      list = list.filter(t => t.userId === uid);
    }

    // Date filter
    list = list.filter(t => {
      if (!t.createdAt) return false;
      const date: Date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      return date >= startDate && date <= endDate;
    });

    // bookingType filter (admin only)
    if (role === 'admin' && this.bookingTypeFilter() !== 'all') {
      list = list.filter(t => t.bookingType === this.bookingTypeFilter());
    }

    // Doctor dropdown filter (admin only)
    if (role === 'admin' && this.selectedDoctorId()) {
      list = list.filter(t => t.doctorId === this.selectedDoctorId());
    }

    // Sort: newest first
    return [...list].sort((a, b) => {
      const da: Date = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt ?? 0);
      const db: Date = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt ?? 0);
      return db.getTime() - da.getTime();
    });
  });

  // ── Stats ──────────────────────────────────────────────
  totalRevenue = computed(() => this.filteredTransactions().reduce((s, t) => s + (t.amount ?? 0), 0));
  appointmentCount = computed(() => this.filteredTransactions().filter(t => t.bookingType === 'appointment').length);
  subscriptionCount = computed(() => this.filteredTransactions().filter(t => t.bookingType === 'subscription').length);
  totalCount = computed(() => this.filteredTransactions().length);

  get isAdmin(): boolean { return this.authService.currentUser?.role === 'admin'; }

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit() {
    this.loadTransactions();
    if (this.isAdmin) {
      this.api.getDoctors().subscribe(docs => this.doctors.set(docs));
    }
  }

  private loadTransactions() {
    this.isLoading.set(true);
    const q = query(collection(this.firestore, 'transactions'), orderBy('createdAt', 'desc'));
    onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this.allTransactions.set(data);
      this.isLoading.set(false);
    }, () => this.isLoading.set(false));
  }

  // ── Period filter ──────────────────────────────────────
  setPeriod(period: Period) {
    if (period === 'custom') {
      this.showCustomDateRange.update(v => !v);
      return;
    }
    this.showCustomDateRange.set(false);
    this.transactionPeriod.set(period);
  }

  applyCustomRange() {
    if (this.customDateError()) return;
    const s = this.customStartDate();
    const e = this.customEndDate();
    if (s && e) {
      this.transactionPeriod.set('custom');
      this.showCustomDateRange.set(false);
    }
  }

  clearCustomRange() {
    this.customStartDate.set('');
    this.customEndDate.set('');
    this.customDateError.set('');
    this.showCustomDateRange.set(false);
    this.transactionPeriod.set('today');
  }

  onCustomDateChange() {
    const s = this.customStartDate();
    const e = this.customEndDate();
    if (s && e && new Date(s) > new Date(e)) {
      this.customDateError.set('From date must be before To date');
    } else {
      this.customDateError.set('');
    }
  }

  private getDateRangeForPeriod(period: Period): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (this.customStartDate() && this.customEndDate()) {
          const [sY, sM, sD] = this.customStartDate().split('-').map(Number);
          startDate = new Date(sY, sM - 1, sD);
          startDate.setHours(0, 0, 0, 0);
          const [eY, eM, eD] = this.customEndDate().split('-').map(Number);
          endDate = new Date(eY, eM - 1, eD);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }
    return { startDate, endDate };
  }

  // ── Export CSV ────────────────────────────────────────
  exportCSV() {
    const txns = this.filteredTransactions();
    if (!txns.length) return;

    const headers = ['#', 'Type', 'Patient', 'Doctor', 'Amount (₹)', 'Payment ID', 'Date', 'Status'];
    const rows = txns.map((t, i) => [
      i + 1,
      t.bookingType ?? '',
      t.patientName ?? t.userName ?? '',
      t.doctorName ?? '—',
      t.amount ?? 0,
      t.razorpayPaymentId ?? t.txnId ?? '',
      this.formatDate(t.createdAt),
      t.paymentStatus ?? ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${this.transactionPeriod()}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ───────────────────────────────────────────
  formatDate(ts: any): string {
    if (!ts) return '—';
    const d: Date = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  trackByTxn(_: number, t: any) { return t.id; }
}
