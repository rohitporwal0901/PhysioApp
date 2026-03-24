import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp, query, where, orderBy, onSnapshot, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

declare var Razorpay: any;

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'half_yearly' | 'yearly';
  features: string[];
}

export interface Transaction {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: 'doctor' | 'lab';
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  planId: string;
  planName: string;
  duration: string;
  status: string;
  paymentDate: Timestamp;
  expiryDate: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private firestore = inject(Firestore);

  // Default Key for Demo (replace with actual key in rzp_test_...)
  private RAZORPAY_KEY = ''; 

  plans: SubscriptionPlan[] = [
    {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      price: 999,
      duration: 'monthly',
      features: ['Full Dashboard Access', '24/7 Support', 'Verified Partner Badge', 'Daily Analytics']
    },
    {
      id: 'plan_half_yearly',
      name: 'Half Yearly',
      price: 4999,
      duration: 'half_yearly',
      features: ['Full Dashboard Access', '16% Savings', 'Verified Partner Badge', 'Priority Support']
    },
    {
      id: 'plan_yearly',
      name: 'Yearly Plan',
      price: 8999,
      duration: 'yearly',
      features: ['Full Dashboard Access', 'Best Value (25% off)', 'Verified Partner Badge', 'Premium Features']
    }
  ];

  async processPayment(plan: SubscriptionPlan, userData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // If no Key ID provided, simulate success for Demo Mode
      if (!this.RAZORPAY_KEY) {
        console.warn('Razorpay Key missing - Running in Demo/Success simulation mode.');
        setTimeout(() => {
          resolve({
            razorpay_payment_id: 'fake_pay_' + Date.now(),
            razorpay_order_id: 'fake_order_' + Date.now(),
            razorpay_signature: 'fake_sig_' + Date.now(),
            status: 'success'
          });
        }, 1500);
        return;
      }

      const options = {
        key: this.RAZORPAY_KEY,
        amount: plan.price * 100, // in paise
        currency: 'INR',
        name: 'PhysioPro',
        description: `${plan.name} Subscription`,
        image: 'assets/logo.png', // Replace with your logo
        handler: (response: any) => {
          resolve({ ...response, status: 'success' });
        },
        prefill: {
          name: userData.fullName || '',
          email: userData.email || '',
          contact: userData.phone || ''
        },
        theme: {
          color: '#4F46E5' // primary-500
        },
        modal: {
          ondismiss: () => {
             // If we want to simulate failure on cancel for testing
             // resolve({ status: 'failed', error: 'User cancelled' });
            reject({ status: 'cancelled' });
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }

  async saveTransaction(paymentData: any, userId: string, plan: SubscriptionPlan, userData?: any, userType: 'doctor' | 'lab' = 'doctor') {
    const txn: Transaction = {
      userId,
      userName: userData?.fullName || 'Unknown User',
      userEmail: userData?.email || 'N/A',
      userType: userType,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id,
      amount: plan.price,
      planId: plan.id,
      planName: plan.name,
      duration: plan.duration,
      status: 'success',
      paymentDate: Timestamp.now(),
      expiryDate: this.calculateExpiry(plan.duration)
    };

    return addDoc(collection(this.firestore, 'payments'), txn);
  }

  calculateExpiry(duration: string): Timestamp {
    const now = new Date();
    if (duration === 'monthly') now.setMonth(now.getMonth() + 1);
    else if (duration === 'half_yearly') now.setMonth(now.getMonth() + 6);
    else if (duration === 'yearly') now.setFullYear(now.getFullYear() + 1);
    
    return Timestamp.fromDate(now);
  }

  async getTransactions(): Promise<Transaction[]> {
    const q = query(
      collection(this.firestore, 'payments'),
      orderBy('paymentDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  }

  // Observable version for real-time updates
  watchTransactions(): Observable<Transaction[]> {
    const q = query(
      collection(this.firestore, 'payments'),
      orderBy('paymentDate', 'desc')
    );
    
    return new Observable(subscriber => {
      return onSnapshot(q, (snapshot) => {
        const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        subscriber.next(txns);
      });
    });
  }
}
