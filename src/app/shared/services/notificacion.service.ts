import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto, NotificationStatus } from '../modeloModelados/notificacion/notificacionDto';

interface FeedOptions {
  status?: NotificationStatus | null;
  take?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURL}/notification`;

  private readonly notifications$ = new BehaviorSubject<NotificationDto[]>([]);
  private currentUserId: number | null = null;

  // 🔹 Observable público para que componentes se suscriban
  public readonly notifications = this.notifications$.asObservable();

  // ======================================================
  // 🔹 Métodos HTTP
  // ======================================================
  getFeed(userId: number, options: FeedOptions = {}): Observable<NotificationDto[]> {
    let params = new HttpParams();
    if (options.status != null) params = params.set('status', String(options.status));
    if (options.take != null) params = params.set('take', String(options.take));

    return this.http.get<NotificationDto[]>(`${this.baseUrl}/feed/${userId}`, {
      params,
      withCredentials: true,
    });
  }

  getUnread(userId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/${userId}/unread`, {
      withCredentials: true,
    });
  }

  markAsRead(notificationId: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.patch<void>(`${this.baseUrl}/${notificationId}/read`, null, {
      params,
      withCredentials: true,
    });
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/mark-all/${userId}/read`, null, {
      withCredentials: true,
    });
  }

  // ======================================================
  // 🔹 Manejo de estado local (para el realtime)
  // ======================================================

  /**
   * Carga inicial de notificaciones desde el backend.
   */
  loadFeed(userId?: number): Promise<void> {
    const uid = userId ?? this.currentUserId;
    if (!uid) return Promise.resolve();

    this.currentUserId = uid;
    return this.getFeed(uid)
      .pipe(
        tap(feed => this.notifications$.next(feed))
      )
      .toPromise()
      .then(() => console.log('📥 Feed de notificaciones cargado'))
      .catch(err => console.error('❌ Error al cargar notificaciones', err));
  }

  /**
   * Maneja una nueva notificación recibida por SignalR.
   * La inserta al inicio del feed actual.
   */
  handleRealtimeNotification(payload: NotificationDto): void {
    const current = this.notifications$.value;
    this.notifications$.next([payload, ...current]);
    console.log('🔔 Notificación en tiempo real recibida:', payload);
  }

  /**
   * Getter sincrónico del array actual.
   */
  get current(): NotificationDto[] {
    return this.notifications$.value;
  }
}
