import type { SlotRaw, TimeOfDay } from '../types';

/* ------------------------------------------------------------------ */
/*  Weekly slot schedules – real Carrefour Belgium LAD hub data        */
/* ------------------------------------------------------------------ */

interface WeeklySlot {
  startTime: string;
  endTime: string;
  capacity: number; // total across zones
}

type DaySchedule = Record<string, WeeklySlot[]>;

function getTimeOfDay(startTime: string): TimeOfDay {
  const hour = parseInt(startTime.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


/* ========================  Home Delivery Schedules (from client CSV)  ======================== */

// Auto-generated from WeeklySlotsHomeDelivery_EN.xlsx
const schedule4459: DaySchedule = {
  Friday: [
    { startTime: '10:00', endTime: '12:00', capacity: 0 },
    { startTime: '11:00', endTime: '13:00', capacity: 0 },
    { startTime: '12:00', endTime: '14:00', capacity: 0 },
    { startTime: '13:00', endTime: '15:00', capacity: 0 },
    { startTime: '14:00', endTime: '16:00', capacity: 0 },
    { startTime: '14:00', endTime: '17:00', capacity: 0 },
    { startTime: '15:00', endTime: '17:00', capacity: 0 },
    { startTime: '15:00', endTime: '18:00', capacity: 0 },
    { startTime: '16:00', endTime: '18:00', capacity: 0 },
    { startTime: '16:00', endTime: '19:00', capacity: 0 },
    { startTime: '17:00', endTime: '19:00', capacity: 0 },
    { startTime: '18:00', endTime: '20:00', capacity: 0 },
    { startTime: '19:00', endTime: '21:00', capacity: 0 },
    { startTime: '19:00', endTime: '22:00', capacity: 0 },
    { startTime: '20:00', endTime: '22:00', capacity: 0 },
    { startTime: '07:00', endTime: '10:00', capacity: 0 },
    { startTime: '08:00', endTime: '10:00', capacity: 0 },
    { startTime: '08:00', endTime: '11:00', capacity: 0 },
    { startTime: '09:00', endTime: '11:00', capacity: 0 },
  ],
  Monday: [
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 15 },
    { startTime: '15:00', endTime: '18:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '16:00', endTime: '19:00', capacity: 6 },
    { startTime: '17:00', endTime: '19:00', capacity: 24 },
    { startTime: '18:00', endTime: '20:00', capacity: 25 },
    { startTime: '19:00', endTime: '21:00', capacity: 23 },
    { startTime: '19:00', endTime: '22:00', capacity: 6 },
    { startTime: '20:00', endTime: '22:00', capacity: 5 },
  ],
  Saturday: [
    { startTime: '10:00', endTime: '12:00', capacity: 15 },
    { startTime: '10:00', endTime: '13:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 23 },
    { startTime: '11:00', endTime: '14:00', capacity: 3 },
    { startTime: '12:00', endTime: '14:00', capacity: 12 },
    { startTime: '12:00', endTime: '15:00', capacity: 13 },
    { startTime: '13:00', endTime: '15:00', capacity: 6 },
    { startTime: '14:00', endTime: '16:00', capacity: 6 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 15 },
    { startTime: '15:00', endTime: '18:00', capacity: 6 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '16:00', endTime: '19:00', capacity: 8 },
    { startTime: '17:00', endTime: '19:00', capacity: 23 },
    { startTime: '18:00', endTime: '20:00', capacity: 21 },
    { startTime: '19:00', endTime: '21:00', capacity: 22 },
    { startTime: '19:00', endTime: '22:00', capacity: 5 },
    { startTime: '20:00', endTime: '22:00', capacity: 6 },
    { startTime: '07:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '10:00', capacity: 9 },
    { startTime: '08:00', endTime: '11:00', capacity: 22 },
    { startTime: '09:00', endTime: '11:00', capacity: 15 },
    { startTime: '09:00', endTime: '12:00', capacity: 8 },
  ],
  Thursday: [
    { startTime: '10:00', endTime: '12:00', capacity: 15 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '12:00', endTime: '14:00', capacity: 21 },
    { startTime: '13:00', endTime: '15:00', capacity: 6 },
    { startTime: '14:00', endTime: '16:00', capacity: 6 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 15 },
    { startTime: '15:00', endTime: '18:00', capacity: 5 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '16:00', endTime: '19:00', capacity: 12 },
    { startTime: '17:00', endTime: '19:00', capacity: 23 },
    { startTime: '17:00', endTime: '20:00', capacity: 7 },
    { startTime: '18:00', endTime: '20:00', capacity: 21 },
    { startTime: '18:00', endTime: '21:00', capacity: 21 },
    { startTime: '19:00', endTime: '21:00', capacity: 21 },
    { startTime: '19:00', endTime: '22:00', capacity: 14 },
    { startTime: '20:00', endTime: '22:00', capacity: 6 },
    { startTime: '07:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '11:00', capacity: 13 },
    { startTime: '09:00', endTime: '11:00', capacity: 15 },
  ],
  Tuesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 15 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '12:00', endTime: '14:00', capacity: 21 },
    { startTime: '13:00', endTime: '15:00', capacity: 6 },
    { startTime: '14:00', endTime: '16:00', capacity: 6 },
    { startTime: '14:00', endTime: '17:00', capacity: 7 },
    { startTime: '15:00', endTime: '17:00', capacity: 10 },
    { startTime: '15:00', endTime: '18:00', capacity: 7 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '16:00', endTime: '19:00', capacity: 12 },
    { startTime: '17:00', endTime: '19:00', capacity: 22 },
    { startTime: '17:00', endTime: '20:00', capacity: 7 },
    { startTime: '18:00', endTime: '20:00', capacity: 21 },
    { startTime: '18:00', endTime: '21:00', capacity: 17 },
    { startTime: '19:00', endTime: '21:00', capacity: 21 },
    { startTime: '19:00', endTime: '22:00', capacity: 12 },
    { startTime: '20:00', endTime: '22:00', capacity: 6 },
    { startTime: '07:00', endTime: '10:00', capacity: 6 },
    { startTime: '08:00', endTime: '10:00', capacity: 9 },
    { startTime: '08:00', endTime: '11:00', capacity: 14 },
    { startTime: '09:00', endTime: '11:00', capacity: 15 },
  ],
  Wednesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 15 },
    { startTime: '11:00', endTime: '13:00', capacity: 24 },
    { startTime: '12:00', endTime: '14:00', capacity: 21 },
    { startTime: '13:00', endTime: '15:00', capacity: 6 },
    { startTime: '14:00', endTime: '16:00', capacity: 6 },
    { startTime: '14:00', endTime: '17:00', capacity: 7 },
    { startTime: '15:00', endTime: '17:00', capacity: 10 },
    { startTime: '15:00', endTime: '18:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '16:00', endTime: '19:00', capacity: 8 },
    { startTime: '17:00', endTime: '19:00', capacity: 24 },
    { startTime: '18:00', endTime: '20:00', capacity: 27 },
    { startTime: '19:00', endTime: '21:00', capacity: 26 },
    { startTime: '19:00', endTime: '22:00', capacity: 11 },
    { startTime: '20:00', endTime: '22:00', capacity: 11 },
    { startTime: '07:00', endTime: '10:00', capacity: 6 },
    { startTime: '08:00', endTime: '10:00', capacity: 9 },
    { startTime: '08:00', endTime: '11:00', capacity: 13 },
    { startTime: '09:00', endTime: '11:00', capacity: 15 },
  ],
};

const schedule4660: DaySchedule = {
  Friday: [
    { startTime: '10:00', endTime: '12:00', capacity: 0 },
    { startTime: '11:00', endTime: '13:00', capacity: 0 },
    { startTime: '11:00', endTime: '14:00', capacity: 0 },
    { startTime: '12:00', endTime: '14:00', capacity: 0 },
    { startTime: '12:00', endTime: '15:00', capacity: 0 },
    { startTime: '13:00', endTime: '15:00', capacity: 0 },
    { startTime: '14:00', endTime: '16:00', capacity: 0 },
    { startTime: '14:00', endTime: '17:00', capacity: 0 },
    { startTime: '15:00', endTime: '17:00', capacity: 0 },
    { startTime: '16:00', endTime: '18:00', capacity: 0 },
    { startTime: '17:00', endTime: '19:00', capacity: 0 },
    { startTime: '18:00', endTime: '20:00', capacity: 0 },
    { startTime: '19:00', endTime: '21:00', capacity: 0 },
    { startTime: '19:00', endTime: '22:00', capacity: 0 },
    { startTime: '20:00', endTime: '22:00', capacity: 0 },
    { startTime: '07:00', endTime: '10:00', capacity: 0 },
    { startTime: '08:00', endTime: '10:00', capacity: 0 },
    { startTime: '08:00', endTime: '11:00', capacity: 0 },
    { startTime: '09:00', endTime: '11:00', capacity: 0 },
  ],
  Monday: [
    { startTime: '14:00', endTime: '16:00', capacity: 6 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 35 },
    { startTime: '16:00', endTime: '18:00', capacity: 38 },
    { startTime: '17:00', endTime: '19:00', capacity: 25 },
    { startTime: '18:00', endTime: '20:00', capacity: 26 },
    { startTime: '19:00', endTime: '21:00', capacity: 21 },
    { startTime: '19:00', endTime: '22:00', capacity: 5 },
  ],
  Saturday: [
    { startTime: '10:00', endTime: '12:00', capacity: 29 },
    { startTime: '11:00', endTime: '13:00', capacity: 20 },
    { startTime: '11:00', endTime: '14:00', capacity: 14 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 4 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 23 },
    { startTime: '16:00', endTime: '18:00', capacity: 34 },
    { startTime: '17:00', endTime: '19:00', capacity: 40 },
    { startTime: '18:00', endTime: '20:00', capacity: 39 },
    { startTime: '19:00', endTime: '21:00', capacity: 37 },
    { startTime: '19:00', endTime: '22:00', capacity: 5 },
    { startTime: '20:00', endTime: '22:00', capacity: 20 },
    { startTime: '07:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '11:00', capacity: 8 },
    { startTime: '09:00', endTime: '11:00', capacity: 25 },
  ],
  Thursday: [
    { startTime: '10:00', endTime: '12:00', capacity: 16 },
    { startTime: '11:00', endTime: '13:00', capacity: 30 },
    { startTime: '11:00', endTime: '14:00', capacity: 6 },
    { startTime: '12:00', endTime: '14:00', capacity: 15 },
    { startTime: '13:00', endTime: '15:00', capacity: 4 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 20 },
    { startTime: '16:00', endTime: '18:00', capacity: 26 },
    { startTime: '17:00', endTime: '19:00', capacity: 29 },
    { startTime: '18:00', endTime: '20:00', capacity: 35 },
    { startTime: '19:00', endTime: '21:00', capacity: 32 },
    { startTime: '19:00', endTime: '22:00', capacity: 8 },
    { startTime: '20:00', endTime: '22:00', capacity: 11 },
    { startTime: '07:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '11:00', capacity: 8 },
    { startTime: '09:00', endTime: '11:00', capacity: 18 },
  ],
  Tuesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 18 },
    { startTime: '11:00', endTime: '13:00', capacity: 28 },
    { startTime: '11:00', endTime: '14:00', capacity: 2 },
    { startTime: '12:00', endTime: '14:00', capacity: 12 },
    { startTime: '12:00', endTime: '15:00', capacity: 8 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 19 },
    { startTime: '16:00', endTime: '18:00', capacity: 42 },
    { startTime: '17:00', endTime: '19:00', capacity: 20 },
    { startTime: '18:00', endTime: '20:00', capacity: 41 },
    { startTime: '19:00', endTime: '21:00', capacity: 37 },
    { startTime: '20:00', endTime: '22:00', capacity: 20 },
    { startTime: '07:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '10:00', capacity: 5 },
    { startTime: '08:00', endTime: '11:00', capacity: 6 },
    { startTime: '09:00', endTime: '11:00', capacity: 2 },
  ],
  Wednesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 17 },
    { startTime: '11:00', endTime: '13:00', capacity: 24 },
    { startTime: '11:00', endTime: '14:00', capacity: 9 },
    { startTime: '12:00', endTime: '14:00', capacity: 14 },
    { startTime: '12:00', endTime: '15:00', capacity: 12 },
    { startTime: '14:00', endTime: '16:00', capacity: 5 },
    { startTime: '14:00', endTime: '17:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 32 },
    { startTime: '16:00', endTime: '18:00', capacity: 33 },
    { startTime: '17:00', endTime: '19:00', capacity: 31 },
    { startTime: '18:00', endTime: '20:00', capacity: 41 },
    { startTime: '19:00', endTime: '21:00', capacity: 31 },
    { startTime: '20:00', endTime: '22:00', capacity: 8 },
    { startTime: '07:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '10:00', capacity: 8 },
    { startTime: '08:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '11:00', capacity: 10 },
  ],
};

const schedule4661: DaySchedule = {
  Friday: [
    { startTime: '10:00', endTime: '12:00', capacity: 0 },
    { startTime: '11:00', endTime: '13:00', capacity: 0 },
    { startTime: '11:00', endTime: '14:00', capacity: 0 },
    { startTime: '12:00', endTime: '15:00', capacity: 0 },
    { startTime: '14:00', endTime: '16:00', capacity: 0 },
    { startTime: '14:00', endTime: '17:00', capacity: 0 },
    { startTime: '15:00', endTime: '17:00', capacity: 0 },
    { startTime: '15:00', endTime: '18:00', capacity: 0 },
    { startTime: '16:00', endTime: '18:00', capacity: 0 },
    { startTime: '17:00', endTime: '19:00', capacity: 0 },
    { startTime: '18:00', endTime: '20:00', capacity: 0 },
    { startTime: '18:00', endTime: '21:00', capacity: 0 },
    { startTime: '19:00', endTime: '21:00', capacity: 0 },
    { startTime: '19:00', endTime: '22:00', capacity: 0 },
    { startTime: '07:00', endTime: '10:00', capacity: 0 },
    { startTime: '08:00', endTime: '10:00', capacity: 0 },
    { startTime: '09:00', endTime: '11:00', capacity: 0 },
  ],
  Monday: [
    { startTime: '14:00', endTime: '17:00', capacity: 12 },
    { startTime: '15:00', endTime: '17:00', capacity: 5 },
    { startTime: '15:00', endTime: '18:00', capacity: 7 },
    { startTime: '16:00', endTime: '18:00', capacity: 17 },
    { startTime: '17:00', endTime: '19:00', capacity: 17 },
    { startTime: '18:00', endTime: '20:00', capacity: 17 },
    { startTime: '18:00', endTime: '21:00', capacity: 7 },
    { startTime: '19:00', endTime: '21:00', capacity: 12 },
    { startTime: '19:00', endTime: '22:00', capacity: 7 },
  ],
  Saturday: [
    { startTime: '10:00', endTime: '12:00', capacity: 14 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '11:00', endTime: '14:00', capacity: 7 },
    { startTime: '12:00', endTime: '14:00', capacity: 14 },
    { startTime: '12:00', endTime: '15:00', capacity: 7 },
    { startTime: '14:00', endTime: '16:00', capacity: 5 },
    { startTime: '14:00', endTime: '17:00', capacity: 5 },
    { startTime: '15:00', endTime: '17:00', capacity: 4 },
    { startTime: '15:00', endTime: '18:00', capacity: 5 },
    { startTime: '16:00', endTime: '18:00', capacity: 9 },
    { startTime: '17:00', endTime: '19:00', capacity: 18 },
    { startTime: '18:00', endTime: '20:00', capacity: 17 },
    { startTime: '18:00', endTime: '21:00', capacity: 5 },
    { startTime: '19:00', endTime: '21:00', capacity: 9 },
    { startTime: '19:00', endTime: '22:00', capacity: 5 },
    { startTime: '08:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '12:00', capacity: 7 },
  ],
  Thursday: [
    { startTime: '10:00', endTime: '12:00', capacity: 14 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '11:00', endTime: '14:00', capacity: 7 },
    { startTime: '12:00', endTime: '14:00', capacity: 14 },
    { startTime: '12:00', endTime: '15:00', capacity: 7 },
    { startTime: '14:00', endTime: '16:00', capacity: 4 },
    { startTime: '14:00', endTime: '17:00', capacity: 4 },
    { startTime: '15:00', endTime: '17:00', capacity: 5 },
    { startTime: '15:00', endTime: '18:00', capacity: 7 },
    { startTime: '16:00', endTime: '18:00', capacity: 18 },
    { startTime: '17:00', endTime: '19:00', capacity: 20 },
    { startTime: '18:00', endTime: '20:00', capacity: 16 },
    { startTime: '18:00', endTime: '21:00', capacity: 6 },
    { startTime: '19:00', endTime: '21:00', capacity: 10 },
    { startTime: '19:00', endTime: '22:00', capacity: 6 },
    { startTime: '08:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '12:00', capacity: 7 },
  ],
  Tuesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 14 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '11:00', endTime: '14:00', capacity: 7 },
    { startTime: '12:00', endTime: '14:00', capacity: 12 },
    { startTime: '12:00', endTime: '15:00', capacity: 5 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '14:00', endTime: '17:00', capacity: 6 },
    { startTime: '15:00', endTime: '17:00', capacity: 7 },
    { startTime: '15:00', endTime: '18:00', capacity: 20 },
    { startTime: '16:00', endTime: '18:00', capacity: 14 },
    { startTime: '16:00', endTime: '19:00', capacity: 13 },
    { startTime: '17:00', endTime: '19:00', capacity: 18 },
    { startTime: '18:00', endTime: '20:00', capacity: 19 },
    { startTime: '18:00', endTime: '21:00', capacity: 10 },
    { startTime: '19:00', endTime: '21:00', capacity: 9 },
    { startTime: '19:00', endTime: '22:00', capacity: 10 },
    { startTime: '08:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '11:00', capacity: 5 },
    { startTime: '09:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '12:00', capacity: 7 },
  ],
  Wednesday: [
    { startTime: '10:00', endTime: '12:00', capacity: 14 },
    { startTime: '11:00', endTime: '13:00', capacity: 21 },
    { startTime: '11:00', endTime: '14:00', capacity: 10 },
    { startTime: '12:00', endTime: '14:00', capacity: 14 },
    { startTime: '12:00', endTime: '15:00', capacity: 11 },
    { startTime: '14:00', endTime: '16:00', capacity: 5 },
    { startTime: '14:00', endTime: '17:00', capacity: 4 },
    { startTime: '15:00', endTime: '17:00', capacity: 5 },
    { startTime: '15:00', endTime: '18:00', capacity: 6 },
    { startTime: '16:00', endTime: '18:00', capacity: 10 },
    { startTime: '17:00', endTime: '19:00', capacity: 15 },
    { startTime: '18:00', endTime: '20:00', capacity: 15 },
    { startTime: '18:00', endTime: '21:00', capacity: 5 },
    { startTime: '19:00', endTime: '21:00', capacity: 9 },
    { startTime: '19:00', endTime: '22:00', capacity: 5 },
    { startTime: '08:00', endTime: '10:00', capacity: 7 },
    { startTime: '08:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '11:00', capacity: 7 },
    { startTime: '09:00', endTime: '12:00', capacity: 7 },
  ],
};


/* ------------------------------------------------------------------ */
/*  All home delivery schedules indexed by store ID                    */
/* ------------------------------------------------------------------ */

const schedules: Record<string, DaySchedule> = {
  '4459': schedule4459,
  '4660': schedule4660,
  '4661': schedule4661,
};

/* ========================  Fast Delivery schedules  ======================== */
/* Shorter windows (1-2h), higher frequency, lower capacity per slot */

export const fastDeliverySchedule: DaySchedule = {
  Monday: [
    { startTime: '10:00', endTime: '12:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 8 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 10 },
    { startTime: '14:00', endTime: '16:00', capacity: 10 },
    { startTime: '15:00', endTime: '17:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 8 },
    { startTime: '17:00', endTime: '19:00', capacity: 12 },
    { startTime: '18:00', endTime: '20:00', capacity: 12 },
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '11:00', capacity: 6 },
    { startTime: '10:00', endTime: '12:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 10 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 10 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 10 },
    { startTime: '17:00', endTime: '19:00', capacity: 12 },
    { startTime: '18:00', endTime: '20:00', capacity: 12 },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '11:00', capacity: 6 },
    { startTime: '10:00', endTime: '12:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 10 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 8 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 10 },
    { startTime: '16:00', endTime: '18:00', capacity: 10 },
    { startTime: '17:00', endTime: '19:00', capacity: 14 },
    { startTime: '18:00', endTime: '20:00', capacity: 14 },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '11:00', capacity: 6 },
    { startTime: '10:00', endTime: '12:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 10 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 10 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 10 },
    { startTime: '17:00', endTime: '19:00', capacity: 14 },
    { startTime: '18:00', endTime: '20:00', capacity: 14 },
  ],
  Friday: [
    { startTime: '10:00', endTime: '12:00', capacity: 6 },
    { startTime: '12:00', endTime: '14:00', capacity: 8 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '16:00', endTime: '18:00', capacity: 10 },
    { startTime: '18:00', endTime: '20:00', capacity: 10 },
  ],
  Saturday: [
    { startTime: '09:00', endTime: '11:00', capacity: 6 },
    { startTime: '10:00', endTime: '12:00', capacity: 8 },
    { startTime: '11:00', endTime: '13:00', capacity: 10 },
    { startTime: '12:00', endTime: '14:00', capacity: 10 },
    { startTime: '13:00', endTime: '15:00', capacity: 8 },
    { startTime: '14:00', endTime: '16:00', capacity: 8 },
    { startTime: '15:00', endTime: '17:00', capacity: 10 },
    { startTime: '16:00', endTime: '18:00', capacity: 12 },
    { startTime: '17:00', endTime: '19:00', capacity: 12 },
  ],
};

/* ========================  Click & Collect schedules  ======================== */
/* Store pickup windows — wider windows, higher capacity, aligned with store hours */

export const clickCollectSchedule: DaySchedule = {
  Monday: [
    { startTime: '10:00', endTime: '12:00', capacity: 20 },
    { startTime: '12:00', endTime: '14:00', capacity: 20 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '18:00', endTime: '20:00', capacity: 10 },
  ],
  Tuesday: [
    { startTime: '08:00', endTime: '10:00', capacity: 15 },
    { startTime: '10:00', endTime: '12:00', capacity: 20 },
    { startTime: '12:00', endTime: '14:00', capacity: 20 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '18:00', endTime: '20:00', capacity: 10 },
  ],
  Wednesday: [
    { startTime: '08:00', endTime: '10:00', capacity: 15 },
    { startTime: '10:00', endTime: '12:00', capacity: 20 },
    { startTime: '12:00', endTime: '14:00', capacity: 20 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '18:00', endTime: '20:00', capacity: 10 },
  ],
  Thursday: [
    { startTime: '08:00', endTime: '10:00', capacity: 15 },
    { startTime: '10:00', endTime: '12:00', capacity: 20 },
    { startTime: '12:00', endTime: '14:00', capacity: 20 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 15 },
    { startTime: '18:00', endTime: '20:00', capacity: 12 },
  ],
  Friday: [
    { startTime: '08:00', endTime: '10:00', capacity: 12 },
    { startTime: '10:00', endTime: '12:00', capacity: 18 },
    { startTime: '12:00', endTime: '14:00', capacity: 18 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 12 },
    { startTime: '18:00', endTime: '20:00', capacity: 10 },
  ],
  Saturday: [
    { startTime: '08:00', endTime: '10:00', capacity: 12 },
    { startTime: '10:00', endTime: '12:00', capacity: 20 },
    { startTime: '12:00', endTime: '14:00', capacity: 20 },
    { startTime: '14:00', endTime: '16:00', capacity: 15 },
    { startTime: '16:00', endTime: '18:00', capacity: 12 },
  ],
};

/* ========================  Slot Generator  ======================== */

export type DeliveryMethodType = 'home' | 'fast' | 'collect';

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateSlots(baseDate: Date, daysAhead: number = 5, storeId: string = '4660', deliveryMethod: DeliveryMethodType = 'home'): SlotRaw[] {
  const slots: SlotRaw[] = [];
  const now = new Date();

  // Pick schedule based on delivery method
  let schedule: DaySchedule;
  if (deliveryMethod === 'fast') {
    schedule = fastDeliverySchedule;
  } else if (deliveryMethod === 'collect') {
    schedule = clickCollectSchedule;
  } else {
    schedule = schedules[storeId] ?? schedule4660;
  }

  // Include today for all methods (time filters removed)
  const startDay = 0;

  for (let d = startDay; d <= 7; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);

    const dayName = DAY_NAMES[date.getDay()];
    if (dayName === 'Sunday') continue;

    const daySlots = schedule[dayName];
    if (!daySlots) continue;

    const dateStr = localDateStr(date);
    // Friday is closed only for home delivery (client data has 0 capacity)
    const isFridayClosed = dayName === 'Friday' && deliveryMethod === 'home';

    daySlots.forEach((ws, idx) => {
      const capacityTotal = ws.capacity || 15;

      // Deterministic pseudo-random usage simulation
      const seed = (d * 7 + idx * 3 + 49297) % 233280;
      const pseudo = seed / 233280;
      const capacityUsed = isFridayClosed
        ? capacityTotal
        : Math.round(capacityTotal * (0.3 + pseudo * 0.4));

      // Cut-off varies by method
      const cutOffHours = deliveryMethod === 'fast' ? 0.75 : deliveryMethod === 'collect' ? 2 : 1.5;
      const [sh, sm] = ws.startTime.split(':').map(Number);
      const totalMin = Math.max(0, sh * 60 + sm - Math.round(cutOffHours * 60));
      const cutOffTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

      const [cutH, cutM] = cutOffTime.split(':').map(Number);
      const cutOffDate = new Date(dateStr);
      cutOffDate.setHours(cutH, cutM, 0, 0);
      const isPastCutOff = now >= cutOffDate;

      // For today's slots: also check if slot start time has already passed
      const isToday = dateStr === localDateStr(now);
      const slotStartDate = new Date(dateStr);
      slotStartDate.setHours(sh, sm, 0, 0);
      const isSlotPassed = isToday && now >= slotStartDate;

      // Green = afternoon slot within first 3 days
      const isGreen =
        !isFridayClosed &&
        deliveryMethod === 'home' &&
        getTimeOfDay(ws.startTime) === 'afternoon' &&
        d <= 3 &&
        pseudo > 0.5;

      slots.push({
        id: `slot-${deliveryMethod}-${dateStr}-${idx}`,
        date: dateStr,
        startTime: ws.startTime,
        endTime: ws.endTime,
        timeOfDay: getTimeOfDay(ws.startTime),
        capacityTotal: isFridayClosed ? 15 : capacityTotal,
        capacityUsed: isFridayClosed ? 15 : capacityUsed,
        isAvailable: !isFridayClosed && capacityUsed < capacityTotal,
        isGreen,
        co2SavedKg: isGreen ? +(0.2 + pseudo * 0.3).toFixed(2) : 0,
        cutOffTime,
        isPastCutOff: false,
        slotLabel: isFridayClosed ? 'Closed' : undefined,
      });
    });
  }

  return slots;
}
