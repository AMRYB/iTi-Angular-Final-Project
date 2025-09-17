import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  userName: string = '';
  userEmail: string = '';
  userMessage: string = '';

}