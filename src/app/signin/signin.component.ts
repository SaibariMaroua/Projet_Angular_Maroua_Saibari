import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { IUserCredentials, UserType } from '../models/User';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'bot-sign-in',
  standalone: true,
  templateUrl: './signin.component.html',
  imports:[FormsModule, CommonModule,HeaderComponent],
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  
 
  credentials: IUserCredentials = { email: '', password: '', userType: UserType.Guest }; 
  signInError: boolean = false;
  registrationError: string = '';
  registrationSuccess: string = '';
  firstName: string = ''; // Déclarer la propriété firstName de type string et l'initialiser à une chaîne vide
  lastName: string = ''; 
  UserType = UserType;
  tel: string = ''; 
  constructor(private userService: UserService, private router: Router) { }

  signIn() {
    this.signInError = false;
    this.userService.signIn(this.credentials).subscribe({
      next: (user: any) => {
        // Mappage explicite de userType reçu du backend avec l'énumération UserType du frontend
        const userType: UserType = UserType[user.userType as keyof typeof UserType];
  
        if (userType === UserType.Admin) {
          this.router.navigate(['/admin']).then(() => {
            window.location.reload();
          });
        } else {
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        }
      },
      error: () => {
        this.signInError = true;
      }
    });
  }
  
  /*
  signIn() {
    this.signInError = false;
    this.userService.signIn(this.credentials).subscribe({
      next: () => this.router.navigate(['/catalog']),
      error: (error) => {
        console.error('Sign-in error:', error);
        this.signInError = true;
      }
    });
  }
*/

register() {
  const userData = {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.credentials.email,
    password: this.credentials.password,
    userType: this.credentials.userType ,
    tel:this.tel
  };

  this.userService.register(userData).subscribe({
    next: () => {
      this.registrationSuccess = 'Registration successful!';
      // Rediriger vers la page de connexion après l'enregistrement réussi
      this.router.navigate(['/signin']);
    },
    error: (error) => {
      console.error('Registration error:', error);
      this.registrationError = 'Registration failed. Please try again.';
    }
  });
}

}
