import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-test-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="payment-modal" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="modal-header">
          <div class="rzp-brand">
            <div class="rzp-logo">
              <i-lucide name="shield-check" class="w-5 h-5 text-white"></i-lucide>
            </div>
            <span>HealthHub Payments</span>
          </div>
          <button class="close-btn" (click)="onCancel()">
            <i-lucide name="x" class="w-4 h-4"></i-lucide>
          </button>
        </div>

        <!-- Amount -->
        <div class="amount-section">
          <p class="amount-label">Amount to Pay</p>
          <p class="amount-value">₹{{ amount | number }}</p>
          <p class="amount-desc">{{ description }}</p>
        </div>

        <!-- Test Mode Badge -->
        <div class="test-badge">
          <i-lucide name="flask-conical" class="w-3.5 h-3.5"></i-lucide>
          <span>TEST MODE — No real money will be charged</span>
        </div>

        <!-- Card Form -->
        <div class="card-form" *ngIf="!isProcessing && !isSuccess">
          <div class="form-group">
            <label>Card Number</label>
            <div class="card-input-wrap">
              <i-lucide name="credit-card" class="w-4 h-4 card-icon"></i-lucide>
              <input
                [(ngModel)]="cardNumber"
                placeholder="4111 1111 1111 1111"
                maxlength="19"
                (input)="formatCard($event)"
                class="card-input"
                [class.prefilled]="cardNumber === '4111 1111 1111 1111'"
              />
            </div>
            <p class="hint">Use test card: <strong>4111 1111 1111 1111</strong></p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expiry</label>
              <input [(ngModel)]="expiry" placeholder="MM/YY" maxlength="5" (input)="formatExpiry($event)" class="card-input" />
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input [(ngModel)]="cvv" placeholder="123" maxlength="3" type="password" class="card-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Name on Card</label>
            <input [(ngModel)]="cardName" [placeholder]="prefillName || 'Your Name'" class="card-input" />
          </div>

          <div *ngIf="errorMsg" class="error-msg">
            <i-lucide name="alert-circle" class="w-3.5 h-3.5"></i-lucide>
            {{ errorMsg }}
          </div>

          <button class="pay-btn" (click)="processPayment()">
            <i-lucide name="lock" class="w-4 h-4"></i-lucide>
            Pay ₹{{ amount | number }} Securely
          </button>
          <button class="cancel-link" (click)="onCancel()">Cancel</button>
        </div>

        <!-- Processing -->
        <div class="processing-wrap" *ngIf="isProcessing">
          <div class="processing-spinner"></div>
          <p class="processing-text">Processing payment...</p>
          <p class="processing-sub">Please wait, do not close this window.</p>
        </div>

        <!-- Success -->
        <div class="success-wrap" *ngIf="isSuccess">
          <div class="success-icon">
            <i-lucide name="check" class="w-8 h-8 text-white"></i-lucide>
          </div>
          <p class="success-text">Payment Successful!</p>
          <p class="success-sub">₹{{ amount | number }} paid securely</p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <i-lucide name="shield" class="w-3 h-3"></i-lucide>
          <span>256-bit SSL Secured</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

    .payment-modal {
      background: white; border-radius: 16px;
      width: 100%; max-width: 400px; margin: 16px;
      overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #0d8abc, #0a6d99);
    }
    .rzp-brand { display: flex; align-items: center; gap: 8px; color: white; font-weight: 700; font-size: 15px; }
    .rzp-logo {
      width: 32px; height: 32px; background: rgba(255,255,255,0.2);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
    }
    .close-btn {
      background: rgba(255,255,255,0.15); border: none; border-radius: 6px;
      color: white; cursor: pointer; padding: 4px; display: flex;
      transition: background 0.2s;
    }
    .close-btn:hover { background: rgba(255,255,255,0.3); }

    .amount-section { padding: 20px 20px 0; text-align: center; }
    .amount-label { font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
    .amount-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .amount-desc { font-size: 13px; color: #475569; }

    .test-badge {
      margin: 12px 20px;
      display: flex; align-items: center; gap: 6px;
      background: #fef3c7; border: 1px solid #fde68a;
      border-radius: 8px; padding: 8px 12px;
      font-size: 11px; font-weight: 600; color: #92400e;
    }

    .card-form { padding: 0 20px 8px; }
    .form-group { margin-bottom: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
    .card-input-wrap { position: relative; }
    .card-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .card-input {
      width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0;
      border-radius: 8px; font-size: 14px; font-weight: 500; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; color: #0f172a;
      font-family: 'Courier New', monospace; box-sizing: border-box;
    }
    .card-input-wrap .card-input { padding-left: 36px; }
    .card-input:focus { border-color: #0d8abc; box-shadow: 0 0 0 3px rgba(13,138,188,0.12); }
    .card-input.prefilled { background: #f0fdf4; border-color: #86efac; }
    .hint { font-size: 11px; color: #64748b; margin-top: 4px; }
    .hint strong { color: #0d8abc; }

    .error-msg {
      display: flex; align-items: center; gap: 6px;
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;
      font-size: 13px; color: #dc2626; font-weight: 500;
    }

    .pay-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #0d8abc, #0a6d99);
      color: white; border: none; border-radius: 10px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s, transform 0.1s;
      margin-bottom: 10px;
    }
    .pay-btn:hover { opacity: 0.92; transform: translateY(-1px); }
    .pay-btn:active { transform: translateY(0); }

    .cancel-link {
      display: block; width: 100%; text-align: center;
      background: none; border: none; color: #94a3b8;
      font-size: 13px; cursor: pointer; padding: 6px; margin-bottom: 4px;
    }
    .cancel-link:hover { color: #64748b; }

    .processing-wrap { padding: 40px 20px; text-align: center; }
    .processing-spinner {
      width: 48px; height: 48px; border-radius: 50%;
      border: 4px solid #e2e8f0; border-top-color: #0d8abc;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg) } }
    .processing-text { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .processing-sub { font-size: 13px; color: #64748b; }

    .success-wrap { padding: 40px 20px; text-align: center; }
    .success-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes pop { from { transform: scale(0) } to { transform: scale(1) } }
    .success-text { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .success-sub { font-size: 14px; color: #16a34a; font-weight: 600; }

    .modal-footer {
      padding: 10px 20px 16px; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 4px;
      font-size: 11px; color: #94a3b8;
    }
  `]
})
export class TestPaymentModalComponent implements OnInit {
  @Input() amount: number = 0;
  @Input() description: string = '';
  @Input() prefillName: string = '';
  @Input() prefillEmail: string = '';

  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentCancelled = new EventEmitter<void>();

  cardNumber = '';
  expiry = '';
  cvv = '';
  cardName = '';
  errorMsg = '';
  isProcessing = false;
  isSuccess = false;

  ngOnInit() {
    // Pre-fill with test card for convenience
    this.cardNumber = '4111 1111 1111 1111';
    this.expiry = '12/28';
    this.cvv = '123';
    this.cardName = this.prefillName;
  }

  formatCard(event: any) {
    let val = event.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    this.cardNumber = val;
    event.target.value = val;
  }

  formatExpiry(event: any) {
    let val = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
    this.expiry = val;
    event.target.value = val;
  }

  processPayment() {
    this.errorMsg = '';
    const rawCard = this.cardNumber.replace(/\s/g, '');

    if (rawCard.length < 16) {
      this.errorMsg = 'Please enter a valid 16-digit card number.';
      return;
    }
    if (this.expiry.length < 5) {
      this.errorMsg = 'Please enter a valid expiry date (MM/YY).';
      return;
    }
    if (this.cvv.length < 3) {
      this.errorMsg = 'Please enter a valid 3-digit CVV.';
      return;
    }

    this.isProcessing = true;

    // Simulate network delay (1.5s)
    setTimeout(() => {
      this.isProcessing = false;
      this.isSuccess = true;

      const fakeResponse = {
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_order_id: `order_test_${Date.now()}`,
        razorpay_signature: `sig_test_${Date.now()}`
      };

      // Emit after 800ms so success screen is visible briefly
      setTimeout(() => {
        this.paymentSuccess.emit(fakeResponse);
      }, 800);
    }, 1500);
  }

  onCancel() {
    if (this.isProcessing || this.isSuccess) return;
    this.paymentCancelled.emit();
  }
}
