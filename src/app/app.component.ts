import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReservationFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kafe-reservation';
}
