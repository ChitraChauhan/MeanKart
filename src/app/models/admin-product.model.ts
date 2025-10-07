export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string[];
  specifications?: {
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    weight?: number;
    [key: string]: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
