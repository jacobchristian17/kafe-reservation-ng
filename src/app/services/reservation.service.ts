import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Reservation, Region, REGIONS, TIME_SLOTS } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservations: Reservation[] = [];
  private availabilitySubject = new BehaviorSubject<{[key: string]: boolean}>({});
  public availability$ = this.availabilitySubject.asObservable();

  constructor() {
    this.initializeMockAvailability();
  }

  private initializeMockAvailability(): void {
    const availability: {[key: string]: boolean} = {};
    const startDate = new Date(2024, 6, 24);
    const endDate = new Date(2024, 6, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = this.formatDate(new Date(d));
      TIME_SLOTS.forEach(time => {
        REGIONS.forEach(region => {
          const key = `${dateStr}_${time}_${region.name}`;
          availability[key] = Math.random() > 0.3;
        });
      });
    }
    
    this.availabilitySubject.next(availability);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  checkAvailability(date: Date, time: string, region: string): boolean {
    const dateStr = this.formatDate(date);
    const key = `${dateStr}_${time}_${region}`;
    const availability = this.availabilitySubject.value;
    return availability[key] || false;
  }

  getAvailableRegions(date: Date, time: string, partySize: number, hasChildren: boolean, wantsSmoking: boolean): Region[] {
    return REGIONS.filter(region => {
      if (region.maxSize < partySize) return false;
      if (hasChildren && !region.childrenAllowed) return false;
      if (wantsSmoking && !region.smokingAllowed) return false;
      
      const isAvailable = this.checkAvailability(date, time, region.name);
      return isAvailable;
    });
  }

  getAvailableTimeSlots(date: Date, region: string): string[] {
    return TIME_SLOTS.filter(time => this.checkAvailability(date, time, region));
  }

  getAlternatives(reservation: Partial<Reservation>): { dates: Date[], times: string[], regions: Region[] } {
    const alternatives = {
      dates: [] as Date[],
      times: [] as string[],
      regions: [] as Region[]
    };

    if (reservation.date && reservation.region) {
      alternatives.times = this.getAvailableTimeSlots(reservation.date, reservation.region);
    }

    if (reservation.date && reservation.time && reservation.partySize !== undefined) {
      alternatives.regions = this.getAvailableRegions(
        reservation.date, 
        reservation.time, 
        reservation.partySize,
        reservation.hasChildren || false,
        reservation.wantsSmoking || false
      );
    }

    const startDate = new Date(2024, 6, 24);
    const endDate = new Date(2024, 6, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (reservation.time && reservation.region) {
        if (this.checkAvailability(new Date(d), reservation.time, reservation.region)) {
          alternatives.dates.push(new Date(d));
        }
      }
    }

    return alternatives;
  }

  makeReservation(reservation: Reservation): Observable<boolean> {
    const dateStr = this.formatDate(reservation.date);
    const key = `${dateStr}_${reservation.time}_${reservation.region}`;
    
    const availability = this.availabilitySubject.value;
    if (!availability[key]) {
      return of(false);
    }

    availability[key] = false;
    this.availabilitySubject.next(availability);
    this.reservations.push(reservation);
    
    setTimeout(() => {
      // this.simulateRandomAvailabilityChanges();
    }, 5000);
    
    return of(true);
  }

  private simulateRandomAvailabilityChanges(): void {
    const availability = this.availabilitySubject.value;
    const keys = Object.keys(availability);
    const randomKeys = keys.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    randomKeys.forEach(key => {
      if (Math.random() > 0.5) {
        availability[key] = !availability[key];
      }
    });
    
    this.availabilitySubject.next(availability);
  }
}