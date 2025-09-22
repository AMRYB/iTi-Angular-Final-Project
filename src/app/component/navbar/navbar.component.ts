import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

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
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url || '';
        this.activeLink =
          url === '/' || url.startsWith('/home') ? 'home' :
          url.startsWith('/about')   ? 'about' :
          url.startsWith('/product') ? 'product' :
          url.startsWith('/contact') ? 'contact' :
          '';
      });
  }

  setActive(link: string) {
    this.activeLink = link;
  }
}
