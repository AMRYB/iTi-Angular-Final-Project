/*export interface Iproduct {
  id: number;
  name: string;
  age: number;
  track: string;
  email: string;
}*/
export interface Iproduct {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  categoryId: number;
  categoryName?: string;
}
