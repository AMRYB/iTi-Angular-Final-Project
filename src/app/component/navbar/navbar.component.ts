import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  activeLink: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('/home')) this.activeLink = 'home';
        else if (url.includes('/about')) this.activeLink = 'about';
        else if (url.includes('/product')) this.activeLink = 'product';
        else if (url.includes('/contact')) this.activeLink = 'contact';
        else this.activeLink = '';
      }
    });
  }

  setActive(link: string) {
    this.activeLink = link;
  }
}

