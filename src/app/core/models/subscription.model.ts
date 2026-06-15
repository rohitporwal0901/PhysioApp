
export type PlanType = 'monthly' | 'halfYearly' | 'yearly';
export type PaymentStatus = 'success' | 'failed' | 'pending';
export type PaymentGateway = 'razorpay' | 'mock';
export type UserType = 'doctor' | 'lab' | 'patient';
export type BookingType = 'subscription' | 'appointment';

export interface Subscription {
  plan: PlanType;
  startDate: any; // Timestamp
  expiryDate: any; // Timestamp
  status: 'active' | 'expired';
}

export interface Transaction {
  id: string;
  bookingType: BookingType;

  // User Info
  userId: string;
  userType: UserType;
  userName?: string;

  // Plan (for subscriptions)
  planType?: PlanType;
  expiryDate?: any; // Timestamp — only for subscriptions

  // Appointment (for booking payments)
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  consultationType?: string;

  // Payment Info
  amount: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  txnId: string;

  // Razorpay-specific fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Timestamps
  createdAt: any; // Firestore serverTimestamp
}

export const SUBSCRIPTION_PLANS = [
  // {
  //   type: 'monthly' as PlanType,
  //   name: 'Monthly Plan',
  //   price: 499,
  //   durationMonths: 1,
  //   features: [
  //     'Digital Patient Records',
  //     'Appointment Scheduling',
  //     'Revenue Tracking',
  //     'Email/SMS Notifications',
  //     'Standard Support'
  //   ],
  //   recommended: false
  // },
  {
    type: 'halfYearly' as PlanType,
    name: 'Half-Yearly Plan',
    price: 2499,
    durationMonths: 6,
    features: [
      'All Monthly Features',
      'Priority Support',
      'Detailed Analytics',
      'Customized Clinic Reports',
      '15% Discount on Yearly'
    ],
    recommended: true
  },
  {
    type: 'yearly' as PlanType,
    name: 'Yearly Plan',
    price: 4499,
    durationMonths: 12,
    features: [
      'All Half-Yearly Features',
      'Dedicated Account Manager',
      'Advanced Marketing Tools',
      'Custom Branding',
      '2 Months FREE'
    ],
    recommended: false
  }
];
