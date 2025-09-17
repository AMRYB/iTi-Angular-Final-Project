import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { ProductComponent } from './component/product/product.component';
import { NotfoundComponent } from './component/notfound/notfound.component';
import { ContactComponent } from './component/contact/contact.component';
import { AboutComponent } from '../../about.component';
//import { AddProductComponent } from './component/add-product/add-product.component';
//hb

export const routes: Routes = [
    {path:'home',component:HomeComponent},
    {path:'product',component:ProductComponent},
    {path:'about',component:AboutComponent},
    {path:'contact',component: ContactComponent},
    {path:'',  redirectTo: 'home', pathMatch:'full'},
   // {path:'product/:id',component:AddProductComponent},

    {path:'**',component:NotfoundComponent},
];

