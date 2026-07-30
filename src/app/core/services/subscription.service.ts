import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  periodicity: 'weekly' | 'monthly' | 'yearly';
  nextPayment: string;
  category?: string;
  notified: boolean;
}

export interface SubscriptionInput {
  name: string;
  price: number;
  currency?: string;
  periodicity: 'weekly' | 'monthly' | 'yearly';
  nextPayment: string;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  subscriptions = signal<Subscription[]>([]);

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.apiUrl).pipe(
      tap((subs) => this.subscriptions.set(subs))
    );
  }

  create(data: SubscriptionInput): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, data).pipe(
      tap((sub) => this.subscriptions.update((subs) => [...subs, sub]))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.subscriptions.update((subs) => subs.filter((s) => s.id !== id)))
    );
  }
}