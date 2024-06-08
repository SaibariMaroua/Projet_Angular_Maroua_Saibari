import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { IUser, IUserCredentials, User } from './models/User';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private baseUrl = 'http://localhost:3000/api';
  private apiUrl = `${this.baseUrl}/users`;
  private user: BehaviorSubject<IUser | null>;

  constructor(private http: HttpClient) {
    // Vérifier si localStorage est défini avant de récupérer l'utilisateur
    const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('currentUser') : null;
    this.user = new BehaviorSubject<IUser | null>(storedUser ? JSON.parse(storedUser) : null);
  }

  getUser(): Observable<IUser | null> {
    return this.user;
  }

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.apiUrl);
  }

 
  
  deleteUser(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.delete<any>(url);
  }
  
  signIn(credentials: IUserCredentials): Observable<IUser> {
   // console.log(this.user)
    return this.http.post<IUser>(`${this.baseUrl}/signin`, credentials).pipe(
      map((user: IUser) => {
        // Stocker l'utilisateur connecté localement
       // localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem("currentUser", JSON.stringify({ id: user._id, firstName: user.firstName,lastName:user.lastName,email :user.email ,cart: user.cart, jwt: "JWT_TOKEN", userType: user.userType , tel :user.tel}));
        
        this.user.next(user);
        return user;
      })
    );
  }


  register(credentials: IUserCredentials): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, credentials).pipe(
      catchError((error) => {
        console.error('Error during registration:', error);
        return throwError('Registration failed. Please try again.');
      })
    );
  }
/*signIn(credentials: IUserCredentials): Observable<IUser> {
  return this.http.post<IUser>(`${this.baseUrl}/users/signin`, credentials)
    .pipe(
      map((user: IUser) => {
        // Stocker l'utilisateur connecté localement
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.user.next(user);
        return user;
      }),
      catchError((error: any) => {
        // Gérer les erreurs d'authentification
        console.error('Error during sign-in:', error);
        throw error; // Propage l'erreur pour que le composant puisse la gérer
      })
    );
}
*/
getCurrentUserId(): string | null {
  // Récupérer l'utilisateur stocké localement
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    const currentUser: any = JSON.parse(storedUser); // Parser l'utilisateur
    return currentUser?.id ? currentUser.id.toString() : null; // Vérifier si currentUser et son ID sont définis
  } else {
    return null;
  }
} 
/*
getCurrentUserId(): string | null {
  // Récupérer l'utilisateur stocké localement
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    const currentUser: User = JSON.parse(storedUser); // Parser l'utilisateur en tant qu'instance de User
    return currentUser.userId.toString(); // Retourner l'ID de l'utilisateur
  } else {
    return null;
  }
}
*/
 signOut() {
    // Supprimer l'utilisateur connecté du stockage local
    localStorage.removeItem('currentUser');
    this.user.next(null);
  }


  
  addToCart(userId: string, productId: string) {
    return this.http.post(`/api/user/cart/add`, { userId, productId });
  }

  private currentUserSubject!: BehaviorSubject<IUser | null>;
  getCurrentUser(): Observable<IUser | null> {
    return this.currentUserSubject.asObservable();
  }



  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.baseUrl}/users`);
  }

  

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.apiUrl}/${userId}`; // Construire l'URL avec l'ID de l'utilisateur
    return this.http.put(url, userData);
  }
  
  
}
