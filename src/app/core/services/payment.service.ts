import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { Transaction, PlanType, UserType, BookingType } from '../models/subscription.model';

declare var Razorpay: any;

const RAZORPAY_KEY_ID = 'rzp_test_T0ghGBsIrMwMjX';

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayOptions {
  amount: number;          // in INR (not paise — service will convert)
  currency?: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private firestore = inject(Firestore);

  /**
   * Opens the Razorpay checkout popup.
   * Resolves with payment response on success.
   * Rejects with error message on failure or cancellation.
   */
  openRazorpay(options: OpenRazorpayOptions): Promise<RazorpayPaymentResult> {
    return new Promise((resolve, reject) => {
      // Guard: Razorpay throws an internal alert when amount is 0
      const amountInPaise = Math.round(options.amount * 100);
      if (amountInPaise <= 0) {
        reject(new Error('Invalid payment amount. Please contact support.'));
        return;
      }

      // Prevents double-resolve/reject since payment.failed fires first, then ondismiss
      let settled = false;
      let paymentError: string | null = null; // set by payment.failed before ondismiss

      const safeResolve = (val: RazorpayPaymentResult) => {
        if (!settled) { settled = true; resolve(val); }
      };
      const safeReject = (err: Error) => {
        if (!settled) { settled = true; reject(err); }
      };

      const rzpOptions = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: options.currency ?? 'INR',
        name: 'HealthHub',
        description: options.description,
        image: 'https://ui-avatars.com/api/?name=HealthHub&background=0d8abc&color=fff&bold=true',
        prefill: {
          name: options.prefill?.name ?? '',
          email: options.prefill?.email ?? '',
          contact: options.prefill?.contact ?? ''
        },
        theme: {
          color: '#0d8abc'
        },
        modal: {
          // ondismiss fires after payment.failed closes the modal — use stored error if available
          ondismiss: () => {
            if (paymentError) {
              safeReject(new Error(paymentError));
            } else {
              safeReject(new Error('Payment cancelled. Please try again.'));
            }
          }
        },
        handler: (response: RazorpayPaymentResult) => {
          // Payment succeeded — resolve before modal auto-dismisses
          safeResolve(response);
        }
      };

      try {
        const rzp = new Razorpay(rzpOptions);
        // Capture failure reason; ondismiss will reject with this message
        rzp.on('payment.failed', (response: any) => {
          paymentError = response.error?.description ?? 'Payment failed. Please try again.';
          // Do NOT call safeReject here; let ondismiss handle it after modal closes
        });
        rzp.open();
      } catch (err: any) {
        safeReject(new Error('Could not open payment window: ' + err.message));
      }
    });
  }

  /**
   * Saves a subscription transaction (Doctor / Lab registration payment).
   */
  async saveSubscriptionTransaction(data: {
    userId: string;
    userType: UserType;
    userName?: string;
    planType: PlanType;
    amount: number;
    paymentResponse: RazorpayPaymentResult;
    expiryDate: Date;
  }): Promise<Transaction> {
    const txnRef = collection(this.firestore, 'transactions');
    const txnId = `txn_${Date.now()}`;

    const transaction: Transaction = {
      id: txnId,
      bookingType: 'subscription',
      userId: data.userId,
      userType: data.userType,
      userName: data.userName ?? '',
      planType: data.planType,
      amount: data.amount,
      currency: 'INR',
      paymentStatus: 'success',
      paymentGateway: 'razorpay',
      txnId: txnId,
      razorpayOrderId: data.paymentResponse.razorpay_order_id ?? null,
      razorpayPaymentId: data.paymentResponse.razorpay_payment_id ?? null,
      razorpaySignature: data.paymentResponse.razorpay_signature ?? null,
      expiryDate: Timestamp.fromDate(data.expiryDate),
      createdAt: serverTimestamp()
    };

    await addDoc(txnRef, transaction);
    return transaction;
  }

  /**
   * Saves an appointment booking transaction (Patient booking payment).
   */
  async saveAppointmentTransaction(data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: string;
    amount: number;
    paymentResponse: RazorpayPaymentResult;
  }): Promise<Transaction> {
    const txnRef = collection(this.firestore, 'transactions');
    const txnId = `txn_${Date.now()}`;

    const transaction: Transaction = {
      id: txnId,
      bookingType: 'appointment',
      userId: data.patientId,
      userType: 'patient',
      userName: data.patientName,
      amount: data.amount,
      currency: 'INR',
      paymentStatus: 'success',
      paymentGateway: 'razorpay',
      txnId: txnId,
      razorpayOrderId: data.paymentResponse.razorpay_order_id ?? null,
      razorpayPaymentId: data.paymentResponse.razorpay_payment_id ?? null,
      razorpaySignature: data.paymentResponse.razorpay_signature ?? null,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      appointmentId: data.appointmentId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      consultationType: data.consultationType,
      createdAt: serverTimestamp()
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
