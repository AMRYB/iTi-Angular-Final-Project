
import { AddProductComponent } from './component/add-product/add-product.component';
import { CartComponent } from './component/cart/cart.component';

//..
import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { ProductComponent } from './component/product/product.component';
import { NotfoundComponent } from './component/notfound/notfound.component';


import { ContactComponent } from './component/contact/contact.component';
import { AboutComponent } from './component/about/about.component';

export const routes: Routes = [
  { path: 'add-product/:id', component: AddProductComponent },
  { path: 'cart', component: CartComponent },
    {path:'home',component:HomeComponent},
   
    {path:'product',component:ProductComponent},
        {path:'about',component:AboutComponent},
    {path:'contact',component: ContactComponent},
    
    {path:'',  redirectTo: 'home', pathMatch:'full'},
 

    {path:'**',component:ProductComponent},
];