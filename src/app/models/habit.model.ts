export interface Habit {
  id: number;
  name: string;
  unit: string;
  dailyTarget: number;
  isActive: boolean;
}

export interface DailyEntry {
  habitId: number;
  habitName: string;
  unit: string;
  date: string;
  value: number;
  dailyTarget: number;
}
