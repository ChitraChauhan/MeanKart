export interface ProductModel {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string[];
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}
