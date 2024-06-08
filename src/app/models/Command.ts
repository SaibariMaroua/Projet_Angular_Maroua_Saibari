// command.model.ts




export interface Command {
  _id: string;
  userId: string;
  products: ProductInCommand[];
  totalPrice: number;
  status: string;
  orderDate: Date;
  shippingAddress: ShippingAddress;
}

export interface ProductInCommand {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
