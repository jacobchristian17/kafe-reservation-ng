import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { TIME_SLOTS, REGIONS } from '../models/reservation.model';

interface DaySlot {
  date: Date;
  dayOfWeek: string;
  dayNumber: number;
  isAvailable: boolean;
  availableSlots: number;
  totalSlots: number;
}

interface TimeSlotAvailability {
  time: string;
  regions: {
    [key: string]: boolean;
  };
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  days: DaySlot[] = [];
  selectedDate: Date | null = null;
  timeSlots: TimeSlotAvailability[] = [];
  regions = REGIONS;
  
  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeCalendar();
  }

  private initializeCalendar() {
    const startDate = new Date('2024-07-24');
    const endDate = new Date('2024-07-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const availability = this.calculateDayAvailability(currentDate);
      
      this.days.push({
        date: currentDate,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
        isAvailable: availability.availableSlots > 0,
        availableSlots: availability.availableSlots,
        totalSlots: availability.totalSlots
      });
    }
  }

  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private calculateDayAvailability(date: Date): { availableSlots: number, totalSlots: number } {
    let availableSlots = 0;
    const totalSlots = TIME_SLOTS.length * REGIONS.length;
    const dateStr = this.formatDateString(date);
    
    TIME_SLOTS.forEach(time => {
      REGIONS.forEach(region => {
        if (this.reservationService.checkAvailability(date, time, region.name)) {
          availableSlots++;
        }
      });
    });
    
    return { availableSlots, totalSlots };
  }

  selectDate(day: DaySlot) {
    if (!day.isAvailable) return;
    
    this.selectedDate = day.date;
    this.loadTimeSlots(day.date);
  }

  private loadTimeSlots(date: Date) {
    const dateStr = this.formatDateString(date);
    this.timeSlots = TIME_SLOTS.map(time => {
      const regions: { [key: string]: boolean } = {};
      
      REGIONS.forEach(region => {
        regions[region.name] = this.reservationService.checkAvailability(date, time, region.name);
      });
      
      return { time, regions };
    });
  }

  navigateToReservation(date: Date, time: string, region: string) {
    const dateStr = this.formatDateString(date);
    this.router.navigate(['/reservation'], {
      queryParams: {
        date: dateStr,
        time: time,
        region: region
      }
    });
  }

  getAvailabilityPercentage(day: DaySlot): number {
    return Math.round((day.availableSlots / day.totalSlots) * 100);
  }

  getAvailabilityClass(day: DaySlot): string {
    const percentage = this.getAvailabilityPercentage(day);
    if (percentage === 0) return 'fully-booked';
    if (percentage < 30) return 'limited';
    if (percentage < 70) return 'moderate';
    return 'available';
  }
}