import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PaymentService, Transaction } from '../../../core/services/payment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  private paymentService = inject(PaymentService);

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading = true;
  searchTerm = '';
  filterStatus = 'all';

  async ngOnInit() {
    try {
      this.transactions = await this.paymentService.getTransactions();
      this.filteredTransactions = [...this.transactions];
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      this.isLoading = false;
    }
  }

  onFilter() {
    this.filteredTransactions = this.transactions.filter(t => {
      const matchesSearch = t.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            t.razorpayPaymentId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            t.planName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' || t.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'failed': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  }
}
