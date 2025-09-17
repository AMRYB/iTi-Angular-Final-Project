import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './component/navbar/navbar.component';
import { HomeComponent } from './component/home/home.component';
import { ProductComponent } from './component/product/product.component';
//import { AddProductComponent } from './component/add-product/add-product.component';
import { FooterComponent } from './component/footer/footer.component';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './component/contact/contact.component';
import { AboutComponent } from './component/about/about.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent,HomeComponent,ProductComponent,FooterComponent,CommonModule,ContactComponent,AboutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'task3';
}
