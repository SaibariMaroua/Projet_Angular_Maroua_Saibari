import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Command } from '../models/Command';


@Injectable({
  providedIn: 'root'
})
export class CommandService {
  
  private apiUrl = 'http://localhost:3000/api/commandes';
  private baseUrl = 'http://localhost:3000/api'; 
  constructor(private http: HttpClient) {}


  passerCommande(commande: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, commande);
  }

  getCommandes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
 
  getUserOrders(userId: string): Observable<any[]> {
    const url = `${this.baseUrl}/utilisateur/${userId}/commandes`; // Construction de l'URL complète avec l'ID de l'utilisateur
    return this.http.get<any[]>(url); // Envoi de la requête GET à l'URL construite
  }
  

  

  // Récupérer toutes les commandes (admin)
  getAllOrders(): Observable<Command[]> {
    return this.http.get<Command[]>(this.apiUrl);
  }

  // Mettre à jour le statut d'une commande (admin)
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}`, { status });
  }

  updateCommandeStatus(id: string, status: string, notification: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status, notification });
  }
}
