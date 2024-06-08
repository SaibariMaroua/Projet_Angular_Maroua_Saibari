import { Component, Input } from '@angular/core';
import { IUser } from '../models/User';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandService } from '../services/command.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule,FormsModule],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent {
  user: IUser | null = null;
  orders: any[] = [];
  currentTab: string = 'profile';
  editMode: boolean = false;

  constructor(private userService: UserService,private commandService: CommandService,private http: HttpClient) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.user = user;
      if (this.user) {
        this.loadUserOrders(); // Appel de la fonction pour charger les commandes de l'utilisateur connecté
      }
    });
    
}


loadUserOrders(): void {
  const userId = this.userService.getCurrentUserId(); // Obtenez l'ID de l'utilisateur connecté
  if (userId) {
    this.commandService.getUserOrders(userId).subscribe(
      (data) => {
        this.orders = data;
        console.log('Commandes de l\'utilisateur:', this.orders);
        this.orders.forEach((commande, index) => {
          const savedState = localStorage.getItem('commande_' + index);
          if (savedState) {
            this.orders[index].messageSeen = JSON.parse(savedState);
          } else {
            this.orders[index].messageSeen = false;
          }
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    );
  } else {
    console.error('ID de l\'utilisateur non trouvé.');
  }
}




  // Méthode pour basculer entre le mode édition et l'affichage du profil
  toggleEditMode() {
    this.editMode = !this.editMode; // Inversez la valeur du mode édition
  }

  hideMessage(commande: any): void {
    commande.messageSeen = true;
    // Save the updated state in local storage
    localStorage.setItem('commande_' + this.orders.indexOf(commande), JSON.stringify(true));
  }


  // Méthode pour définir l'onglet actif
  setCurrentTab(tab: string) {
    this.currentTab = tab; // Définissez l'onglet actif sur celui qui a été cliqué
  }

  showSignOutMenu: boolean = false;
  signOut() {
    this.userService.signOut();
    this.showSignOutMenu = false;
  }

  
}
