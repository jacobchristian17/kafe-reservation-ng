import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { Region, REGIONS, TIME_SLOTS, Reservation } from '../../models/reservation.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit, OnDestroy {
  reservationForm: FormGroup;
  regions = REGIONS;
  timeSlots = TIME_SLOTS;
  availableDates: Date[] = [];
  availableRegions: Region[] = [];
  availableTimeSlots: string[] = [];
  minDate: string;
  maxDate: string;
  showAlternatives = false;
  alternatives: any = { dates: [], times: [], regions: [] };
  reservationConfirmed = false;
  reservationError = false;
  currentStep = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const today = new Date();
    this.minDate = '2024-07-24';
    this.maxDate = '2024-07-31';

    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      partySize: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
      region: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      hasChildren: [false],
      wantsSmoking: [false]
    });

    this.initializeDates();
  }

  ngOnInit(): void {
    // Handle query parameters from calendar
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.reservationForm.patchValue({ date: params['date'] });
      }
      if (params['time']) {
        this.reservationForm.patchValue({ time: params['time'] });
      }
      if (params['region']) {
        this.reservationForm.patchValue({ region: params['region'] });
      }
    });

    this.reservationService.availability$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkCurrentSelectionAvailability();
      });

    this.reservationForm.get('date')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(date => {
        if (date) {
          this.updateAvailableTimeSlots();
          this.updateAvailableRegions();
        }
      });

    this.reservationForm.get('time')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(time => {
        if (time) {
          this.updateAvailableRegions();
        }
      });

    this.reservationForm.get('partySize')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateAvailableRegions();
      });

    this.reservationForm.get('hasChildren')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateAvailableRegions();
      });

    this.reservationForm.get('wantsSmoking')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateAvailableRegions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDates(): void {
    const startDate = new Date(2024, 6, 24);
    const endDate = new Date(2024, 6, 31);
    
    this.availableDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      this.availableDates.push(new Date(d));
    }
  }

  private updateAvailableTimeSlots(): void {
    const date = this.reservationForm.get('date')?.value;
    const region = this.reservationForm.get('region')?.value;
    
    if (date && region) {
      this.availableTimeSlots = this.reservationService.getAvailableTimeSlots(
        new Date(date), 
        region
      );
    } else {
      this.availableTimeSlots = TIME_SLOTS;
    }
  }

  private updateAvailableRegions(): void {
    const date = this.reservationForm.get('date')?.value;
    const time = this.reservationForm.get('time')?.value;
    const partySize = this.reservationForm.get('partySize')?.value;
    const hasChildren = this.reservationForm.get('hasChildren')?.value;
    const wantsSmoking = this.reservationForm.get('wantsSmoking')?.value;

    if (date && time) {
      this.availableRegions = this.reservationService.getAvailableRegions(
        new Date(date),
        time,
        partySize,
        hasChildren,
        wantsSmoking
      );
      
      const currentRegion = this.reservationForm.get('region')?.value;
      if (currentRegion && !this.availableRegions.find(r => r.name === currentRegion)) {
        this.reservationForm.get('region')?.setValue('');
        this.showAlternativeOptions();
      }
    }
  }

  private checkCurrentSelectionAvailability(): void {
    const date = this.reservationForm.get('date')?.value;
    const time = this.reservationForm.get('time')?.value;
    const region = this.reservationForm.get('region')?.value;

    if (date && time && region) {
      const isAvailable = this.reservationService.checkAvailability(
        new Date(date),
        time,
        region
      );

      if (!isAvailable) {
        this.showAlternativeOptions();
      }
    }
  }

  private showAlternativeOptions(): void {
    const formValue = this.reservationForm.value;
    this.alternatives = this.reservationService.getAlternatives({
      date: formValue.date ? new Date(formValue.date) : undefined,
      time: formValue.time,
      region: formValue.region,
      partySize: formValue.partySize,
      hasChildren: formValue.hasChildren,
      wantsSmoking: formValue.wantsSmoking
    });
    this.showAlternatives = true;
  }

  selectAlternativeDate(date: Date): void {
    this.reservationForm.get('date')?.setValue(date.toISOString().split('T')[0]);
    this.showAlternatives = false;
  }

  selectAlternativeTime(time: string): void {
    this.reservationForm.get('time')?.setValue(time);
    this.showAlternatives = false;
  }

  selectAlternativeRegion(region: Region): void {
    this.reservationForm.get('region')?.setValue(region.name);
    this.showAlternatives = false;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const dateTimeValid = this.reservationForm.get('date')?.valid && 
                           this.reservationForm.get('time')?.valid &&
                           this.reservationForm.get('partySize')?.valid;
      if (dateTimeValid) {
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      const preferencesValid = this.reservationForm.get('region')?.valid;
      if (preferencesValid) {
        this.currentStep = 3;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      const reservation: Reservation = {
        ...this.reservationForm.value,
        date: new Date(this.reservationForm.value.date)
      };

      this.reservationService.makeReservation(reservation).subscribe(success => {
        if (success) {
          this.reservationConfirmed = true;
          this.reservationError = false;
        } else {
          this.reservationError = true;
          this.showAlternativeOptions();
        }
      });
    }
  }

  resetForm(): void {
    this.reservationForm.reset({
      partySize: 2,
      hasChildren: false,
      wantsSmoking: false
    });
    this.reservationConfirmed = false;
    this.reservationError = false;
    this.showAlternatives = false;
    this.currentStep = 1;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}