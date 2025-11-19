import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private multaUpdatedSubject = new BehaviorSubject<any>(null);

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public multaUpdated$ = this.multaUpdatedSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  private startConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiURL.replace('/api', '')}/multasHub`, {
        // Configuración adicional si es necesaria
        skipNegotiation: true,
        transport: 1 // WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');
        this.connectionStatusSubject.next(true);
        this.registerEventHandlers();
      })
      .catch(err => {
        console.error('Error while starting SignalR connection: ' + err);
        this.connectionStatusSubject.next(false);
      });

    this.hubConnection.onclose(() => {
      console.log('SignalR Connection closed');
      this.connectionStatusSubject.next(false);
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.connectionStatusSubject.next(true);
    });
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Escuchar actualizaciones de estado (envía el backend)
    this.hubConnection.on('ReceiveStatusUpdate', (multaId: number, newStatus: string) => {
      console.log('Estado de multa actualizado via SignalR:', { multaId, newStatus });
      this.multaUpdatedSubject.next({ type: 'statusUpdate', multaId, newStatus });
    });

    // Escuchar actualizaciones completas de multa (envía el backend)
    this.hubConnection.on('MultaUpdated', (multaData: any) => {
      console.log('Multa actualizada via SignalR:', multaData);
      this.multaUpdatedSubject.next({ type: 'fullUpdate', data: multaData });
    });
  }

  // El backend usa Clients.All, así que no necesitamos grupos por ahora
  // Métodos de grupos comentados por si se necesitan en el futuro

  /*
  // Método para unirse a un grupo específico (opcional)
  public joinGroup(groupName: string): void {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('JoinGroup', groupName)
        .catch(err => console.error('Error joining group:', err));
    }
  }

  // Método para salir de un grupo (opcional)
  public leaveGroup(groupName: string): void {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('LeaveGroup', groupName)
        .catch(err => console.error('Error leaving group:', err));
    }
  }
  */

  // Método para detener la conexión
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  // Método para verificar estado de conexión
  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }
}