// product.model.ts
export class Product {
    _id: string;
    name: string;
    title: string;
    quantity: number;
    price: number;
    category: string;
    details: string;
    imagePath: string;
    rating: number;
    isLowStock: boolean = false;
    showDescription: boolean = false; 
    selectedQuantity: number = 1;
    constructor(id: string, name: string,title :string , quantity: number, price: number, category: string ,details : string , imagePath:string, rating: number) {
      this._id = id;
      this.name = name;
      this.title = title;
      this.quantity = quantity;
      this.price = price;
      this.category = category;
      this.details = details;
      this.imagePath = imagePath ;
      this.rating = rating ;
    }
  }
