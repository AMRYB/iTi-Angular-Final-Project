import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { ProductComponent } from './component/product/product.component';
import { NotfoundComponent } from './component/notfound/notfound.component';
import { ContactComponent } from './component/contact/contact.component';
import { AboutComponent } from './component/about/about.component';

export const routes: Routes = [
    {path:'home',component:HomeComponent},
    {path:'product',component:ProductComponent},
        {path:'about',component:AboutComponent},
    {path:'contact',component: ContactComponent},
    {path:'',  redirectTo: 'home', pathMatch:'full'},
   // {path:'product/:id',component:AddProductComponent},

    {path:'**',component:NotfoundComponent},
];

