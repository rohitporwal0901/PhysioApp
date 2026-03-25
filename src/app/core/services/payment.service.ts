import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Transaction, PlanType, UserType } from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private firestore = inject(Firestore);

  async createOrder(plan: PlanType, amount: number) {
    // Logic for Razorpay order creation (backend) would go here
    // For now, returning a mock order details
    return { 
      orderId: `order_mock_${Date.now()}`,
      amount: amount * 100, // paise for Razorpay
      currency: 'INR'
    };
  }

  async verifyPayment(orderId: string, paymentResponse: any): Promise<boolean> {
    // Logic for Razorpay signature verification would go here
    // For now, mock a successful verification after 1 second delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1500);
    });
  }

  async saveTransaction(data: {
    userId: string,
    userType: UserType,
    planType: PlanType,
    amount: number,
    paymentStatus: 'success' | 'failed' | 'pending',
    txnId: string,
    expiryDate: Date
  }) {
    const txnRef = collection(this.firestore, 'transactions');
    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      userId: data.userId,
      userType: data.userType,
      planType: data.planType,
      amount: data.amount,
      currency: 'INR',
      paymentStatus: data.paymentStatus,
      paymentGateway: 'mock',
      txnId: data.txnId,
      createdAt: serverTimestamp(),
      expiryDate: Timestamp.fromDate(data.expiryDate)
    };

    await addDoc(txnRef, transaction);
    return transaction;
  }

  calculateExpiryDate(plan: PlanType, startDate: Date = new Date()): Date {
    const date = new Date(startDate);
    if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (plan === 'halfYearly') date.setMonth(date.getMonth() + 6);
    else if (plan === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
  }
}
