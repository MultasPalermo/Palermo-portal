import { ApplicationRef, inject, Injectable, NgZone } from '@angular/core';
import { BaseRealtimeService } from './base-Realtime.service';
import { NotificationService } from '../../../shared/services/notificacion.service';
import { NotificationDto } from '../../../shared/modeloModelados/notificacion/notificacionDto';

@Injectable({ providedIn: 'root' })
export class NotificationsRealtimeService extends BaseRealtimeService {
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private readonly store = inject(NotificationService);

  constructor() {
    super();
    this.connect('notifications'); // Hub => /hubs/notifications
    this.bindHandlers();
  }

  private bindHandlers(): void {
    // 👇 depende de cómo llames el evento en el backend
    this.hub!.on('notifications:new', (payload: NotificationDto) => {
      this.zone.run(() => this.handleNotification(payload));
    });

    this.hub!.on('ReceiveNotification', (payload: NotificationDto) => {
      this.zone.run(() => this.handleNotification(payload));
    });

    this.hub!.onreconnected(() => {
      this.zone.run(() => this.handleReconnected());
    });
  }

  protected handleNotification(payload: NotificationDto): void {
    this.store.handleRealtimeNotification(payload);
    this.appRef.tick();
  }

  protected handleReconnected(): void {
    void this.store.loadFeed();
  }
}
