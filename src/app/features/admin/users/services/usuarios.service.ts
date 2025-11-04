import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserInfraction {
  id?: number;
  dateInfraction: string;
  stateInfraction: boolean;
  observations: string;
  userId: number;
  typeInfractionId: number;
  userNotificationId: number;
}

// Interfaz para los datos que devuelve la API actualmente
export interface UsuarioAPI {
  id: number;
  email: string;
  documentTypeId: number;
  typeDocument: string;
  documentNumber: string;
}

// Interfaz para la nueva estructura que esperamos usar
export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  personId: number;
  userInfractions?: UserInfraction[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiUrl = 'https://localhost:7286/api/Users';

  constructor(private http: HttpClient) {}

  // Mapear datos de API a estructura frontend
  private mapearUsuarioAPI(usuarioAPI: UsuarioAPI): Usuario {
    return {
      id: usuarioAPI.id,
      name: '', // No disponible en API actual
      email: usuarioAPI.email,
      password: '', // No disponible en API actual
      personId: usuarioAPI.documentTypeId || 1, // Usar documentTypeId temporalmente
      userInfractions: []
    };
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<UsuarioAPI[]>(this.apiUrl).pipe(
      map((usuariosAPI: UsuarioAPI[]) =>
        usuariosAPI.map(user => this.mapearUsuarioAPI(user))
      )
    );
  }

  // Obtener un usuario por ID
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<UsuarioAPI>(`${this.apiUrl}/${id}`).pipe(
      map((usuarioAPI: UsuarioAPI) => this.mapearUsuarioAPI(usuarioAPI))
    );
  }

  // Crear un nuevo usuario
  createUsuario(usuario: Omit<Usuario, 'id' | 'userInfractions'>): Observable<Usuario> {
    // Convertir a la estructura que espera la API actual
    const usuarioAPI = {
      email: usuario.email,
      documentTypeId: usuario.personId, // Temporalmente mapear personId a documentTypeId
      documentNumber: '123456789' // Valor temporal hasta que se actualice la API
    };

    return this.http.post<UsuarioAPI>(this.apiUrl, usuarioAPI).pipe(
      map(response => this.mapearUsuarioAPI(response))
    );
  }

  // Actualizar un usuario
  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    // Convertir a la estructura que espera la API actual
    const usuarioAPI = {
      email: usuario.email,
      documentTypeId: usuario.personId || 1,
      documentNumber: '123456789' // Valor temporal
    };

    return this.http.put<UsuarioAPI>(`${this.apiUrl}/${id}`, usuarioAPI).pipe(
      map(response => this.mapearUsuarioAPI(response))
    );
  }

  // Eliminar un usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
