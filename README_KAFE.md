# Kafè Reservation System

A single-page Angular application for making table reservations at Kafè restaurant.

## Features

- **Date & Time Selection**: Reserve tables between July 24-31, with 30-minute slots from 6:00 PM to 10:00 PM
- **Smart Region Selection**: Automatically filters dining regions based on party size, children, and smoking preferences
- **Dynamic Availability**: Real-time updates when slots become unavailable
- **Alternative Suggestions**: Provides alternative dates, times, or regions when selections are unavailable
- **Multi-step Form**: Guided reservation process with progress tracking
- **Form Validation**: Ensures all required information is collected
- **Responsive Design**: Works on desktop and mobile devices

## Dining Regions

| Region              | Max Size | Children Allowed | Smoking Allowed |
| ------------------- | -------- | ---------------- | --------------- |
| Main Hall           | 12       | Yes              | No              |
| Bar                 | 4        | No               | Yes             |
| Riverside           | 8        | Yes              | Yes             |
| Riverside (smoking) | 6        | No               | Yes             |

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:4200
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── reservation-form/     # Main reservation form component
│   ├── models/
│   │   └── reservation.model.ts  # Data models and constants
│   ├── services/
│   │   └── reservation.service.ts # Business logic and availability management
│   └── app.component.*            # Root component
└── styles.css                     # Global styles
```

## How It Works

1. **Step 1 - Date & Time**: User selects a date (July 24-31), preferred time slot, and party size
2. **Step 2 - Preferences**: User specifies if children are present and if anyone wants to smoke, then selects an available dining region
3. **Step 3 - Contact Info**: User enters their name, email, and phone number, reviews the reservation summary, and confirms

The system dynamically updates available regions based on preferences and simulates real-time availability changes. If a selected option becomes unavailable, alternatives are automatically suggested.