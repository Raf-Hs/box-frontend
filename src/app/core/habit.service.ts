import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, DailyEntry } from '../models/habit.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/habits`);
  }

  updateTarget(id: number, dailyTarget: number): Observable<Habit> {
    return this.http.patch<Habit>(`${this.apiUrl}/habits/${id}`, { dailyTarget });
  }

  getDailyEntries(date: string): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(`${this.apiUrl}/daily-entries`, { params: { date } });
  }

  setEntryValue(habitId: number, date: string, value: number): Observable<DailyEntry> {
    return this.http.put<DailyEntry>(`${this.apiUrl}/daily-entries/${habitId}/${date}`, { value });
  }

  getHistory(from: string, to: string): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(`${this.apiUrl}/daily-entries/history`, { params: { from, to } });
  }
}
