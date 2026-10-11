import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/habit.service';
import { DailyEntry } from '../../models/habit.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <header class="history-header">
        <h1>History</h1>
        <div class="date-range">
          <div class="date-field">
            <label for="from-date">From:</label>
            <input
              id="from-date"
              type="date"
              [value]="fromDate()"
              (change)="onFromDateChange($event)"
            />
          </div>
          <div class="date-field">
            <label for="to-date">To:</label>
            <input
              id="to-date"
              type="date"
              [value]="toDate()"
              (change)="onToDateChange($event)"
            />
          </div>
          <button class="btn btn-load" (click)="loadHistory()">Load</button>
        </div>
      </header>

      @if (loading()) {
        <div class="state-message">Loading...</div>
      } @else if (error()) {
        <div class="state-message error">{{ error() }}</div>
      } @else if (history().length === 0) {
        <div class="state-message">No history found for this date range.</div>
      } @else {
        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>Habit</th>
                <th>Date</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of history(); track entry.habitId + entry.date) {
                <tr>
                  <td>{{ entry.habitName }}</td>
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.value }}</td>
                  <td>{{ entry.unit }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .history-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
        background-color: #f5f5f5;
        min-height: 100vh;
      }

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .history-header h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }

      .date-range {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        flex-wrap: wrap;
      }

      .date-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .date-field label {
        font-size: 12px;
        font-weight: 500;
        color: #555;
      }

      .date-field input {
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        background: #fff;
      }

      .btn-load {
        padding: 8px 20px;
        background: #1976d2;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-load:hover {
        background: #1565c0;
      }

      .state-message {
        text-align: center;
        padding: 48px;
        color: #666;
        font-size: 16px;
      }

      .state-message.error {
        color: #d32f2f;
      }

      .table-container {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
      }

      .history-table th,
      .history-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .history-table th {
        background: #fafafa;
        font-weight: 600;
        color: #333;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .history-table td {
        font-size: 14px;
        color: #555;
      }

      .history-table tbody tr:hover {
        background: #f5f5f5;
      }

      .history-table tbody tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
})
export class HistoryComponent implements OnInit {
  private habitService = inject(HabitService);

  fromDate = signal<string>(this.getDefaultFromDate());
  toDate = signal<string>(this.getDefaultToDate());
  history = signal<DailyEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  private getDefaultToDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onFromDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.fromDate.set(input.value);
    }
  }

  onToDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.toDate.set(input.value);
    }
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.habitService.getHistory(this.fromDate(), this.toDate()).subscribe({
      next: (data) => {
        this.history.set(data);
        this.loading.set(false);
      },
      err: (err) => {
        this.error.set('Failed to load history. Please try again.');
        this.loading.set(false);
        console.error('Failed to load history:', err);
      },
    });
  }
}
