
export type PlanType = 'monthly' | 'halfYearly' | 'yearly';
export type PaymentStatus = 'success' | 'failed' | 'pending';
export type PaymentGateway = 'razorpay' | 'mock';
export type UserType = 'doctor' | 'lab';

export interface Subscription {
  plan: PlanType;
  startDate: any; // Timestamp
  expiryDate: any; // Timestamp
  status: 'active' | 'expired';
}

export interface Transaction {
  id: string;
  userId: string;
  userType: UserType;
  planType: PlanType;
  amount: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  txnId: string;
  createdAt: any; // Timestamp
  expiryDate: any; // Timestamp
}

export const SUBSCRIPTION_PLANS = [
  {
    type: 'monthly' as PlanType,
    name: 'Monthly Plan',
    price: 499,
    durationMonths: 1,
    features: [
      'Digital Patient Records',
      'Appointment Scheduling',
      'Revenue Tracking',
      'Email/SMS Notifications',
      'Standard Support'
    ],
    recommended: false
  },
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
