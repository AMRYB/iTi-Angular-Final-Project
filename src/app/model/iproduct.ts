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
  category: string;
  image: string;
  customer?: string;
  location?: string;
  startDate?: string;
  duration?: string;
  projectSize?: string;
  description?: string;
  gallery?: string[];
}
