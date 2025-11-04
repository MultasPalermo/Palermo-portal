// core/services/servicesGeneric/session-ping.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { interval as rxInterval, Subscription, of, switchMap, catchError, interval } from 'rxjs';
import { DocumentSessionService } from '../documents/document-session.service';

@Injectable({ providedIn: 'root' })
export class SessionPingService implements OnDestroy {
  private sub?: Subscription;
  private defaultMs = 70_000;

  constructor(private api: DocumentSessionService) {}

  start(ms: number = this.defaultMs) {
    this.stop();
    this.sub = interval(ms).pipe(
      switchMap(() =>
        this.api.pingDocSession().pipe(
          catchError(() => {
            this.stop();
            return of(null);
          })
        )
      )
    ).subscribe();
  }

  stop() {
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  ngOnDestroy() {
    this.stop();
  }
}
