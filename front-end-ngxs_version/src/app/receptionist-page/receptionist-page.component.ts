import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Route, Router } from '@angular/router';

@Component({
  selector: 'app-receptionist-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './receptionist-page.component.html',
  styleUrl: './receptionist-page.component.scss'
})
export class ReceptionistPageComponent {

constructor(private router: Router) {}

  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

}
