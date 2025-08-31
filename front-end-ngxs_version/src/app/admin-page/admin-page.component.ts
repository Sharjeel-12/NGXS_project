import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {

constructor(private router: Router) {}

  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

}
