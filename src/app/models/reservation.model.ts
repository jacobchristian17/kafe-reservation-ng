export interface Region {
  name: string;
  maxSize: number;
  childrenAllowed: boolean;
  smokingAllowed: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Reservation {
  date: Date;
  time: string;
  partySize: number;
  region: string;
  name: string;
  email: string;
  phone: string;
  hasChildren: boolean;
  wantsSmoking: boolean;
}

export const REGIONS: Region[] = [
  { name: 'Main Hall', maxSize: 12, childrenAllowed: true, smokingAllowed: false },
  { name: 'Bar', maxSize: 4, childrenAllowed: false, smokingAllowed: true },
  { name: 'Riverside', maxSize: 8, childrenAllowed: true, smokingAllowed: true },
  { name: 'Riverside (smoking)', maxSize: 6, childrenAllowed: false, smokingAllowed: true }
];

export const TIME_SLOTS: string[] = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];