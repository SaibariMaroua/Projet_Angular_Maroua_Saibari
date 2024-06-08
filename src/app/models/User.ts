import { Product } from "./Product";

export class User {
  // readonly permet d’empêcher les assignations en dehors du constructeur.
  private _firstName: String = "";
  public get firstName(): String {
      return this._firstName;
  }
  public set firstName(value: String) {
      this._firstName = value;
  }

  private _lastName?: String | undefined = "";
  public get lastName(): String | undefined {
      return this._lastName;
  }
  public set lastName(value: String | undefined) {
      this._lastName = value;
  }

  private _email: string;
  public get email(): string {
      return this._email;
  }
  public set email(value: string) {
      this._email = value;
  }

  private _userType: string;
  public get userType(): string {
      return this._userType;
  }
  public set userType(value: string) {
      this._userType = value;
  }

  private _password: string;
  public get password(): string {
      return this._password;
  }
  public set password(value: string) {
      this._password = value;
  }

  private _cart: Product[] = [];
  public get cart(): Product[] {
      return this._cart;
  }
  public set cart(value: Product[]) {
      this._cart = value;
  }

  private _tel: string; // Nouvelle propriété pour le numéro de téléphone

  public get tel(): string {
    return this._tel;
  }

  public set tel(value: string) {
    this._tel = value;
  }
  /*constructor(readonly userId: String){
      
  }*/
  constructor(readonly _id: string, firstname: string, lastName: string, Email: string, Password: string, type: string,  userType: UserType,cart: Product[] = [] ,  tel: string){
    this._firstName = firstname;
    this._lastName = lastName; // Correction de cette ligne
    this._email = Email;
    this._password = Password;
    this._userType = userType;
    this._cart = cart;
    this._tel = tel;
}

  public fullName(): String{
      return this.firstName + " " + this.lastName
  }

  public greetUser(){
      return this.userType.toString() + "\nHello "+ this.fullName()
  }
}

export enum UserType {
    Client = "Client",
    Admin = "Admin",
    Guest = "Guest"
}


export interface IUserCredentials {
  email : string;
  password: string;
  userType: UserType;
}  

export interface IUser {
    _id:string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
  cart: Product[];
  tel: string; 
}

