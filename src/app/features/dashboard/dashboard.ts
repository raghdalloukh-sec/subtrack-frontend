import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService, SubscriptionInput } from '../../core/services/subscription.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);

  subscriptions = this.subscriptionService.subscriptions;
  showForm = false;
  errorMessage = '';
  logoErrors = new Set<string>();

  minDate = new Date().toISOString().split('T')[0];

  newSub: SubscriptionInput = {
    name: '',
    price: 0,
    periodicity: 'monthly',
    nextPayment: '',
    currency: 'MAD',
  };

  totalMonthly = computed(() => {
    return this.subscriptions().reduce((sum, sub) => {
      if (sub.periodicity === 'monthly') return sum + sub.price;
      if (sub.periodicity === 'yearly') return sum + sub.price / 12;
      if (sub.periodicity === 'weekly') return sum + sub.price * 4.33;
      return sum;
    }, 0);
  });

  ngOnInit() {
    this.subscriptionService.loadAll().subscribe();
  }

  isUpcoming(dateStr: string): boolean {
    const diffDays = (new Date(dateStr).getTime() - Date.now()) / 86400000;
    return diffDays >= 0 && diffDays <= 7;
  }

  getLogoUrl(name: string): string {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://cdn.simpleicons.org/${slug}`;
  }

  onLogoError(id: string) {
    this.logoErrors.add(id);
  }

  onAddSubscription() {
    this.errorMessage = '';

    if (this.newSub.nextPayment < this.minDate) {
      this.errorMessage = 'La date de paiement ne peut pas être dans le passé';
      return;
    }

    const payload = {
      ...this.newSub,
      nextPayment: new Date(this.newSub.nextPayment).toISOString(),
    };

    this.subscriptionService.create(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.newSub = { name: '', price: 0, periodicity: 'monthly', nextPayment: '', currency: 'MAD' };
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la création';
      },
    });
  }

  onDelete(id: string) {
    this.subscriptionService.delete(id).subscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}