import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HabitService } from '../../core/habit.service';
import { Habit, DailyEntry } from '../../models/habit.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Daily Tracker</h1>
        <div class="date-picker">
          <label for="date">Date:</label>
          <input
            id="date"
            type="date"
            [value]="selectedDate()"
            (change)="onDateChange($event)"
          />
        </div>
      </header>

      @if (loading()) {
        <div class="state-message">Loading...</div>
      } @else if (error()) {
        <div class="state-message error">{{ error() }}</div>
      } @else if (entries().length === 0) {
        <div class="state-message">No entries for this date.</div>
      } @else {
        <div class="total-progress">
          <div class="total-progress-header">
            <span>Total Daily Progress</span>
            <span>{{ totalProgress() }}%</span>
          </div>
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              [style.width.%]="totalProgress()"
            ></div>
          </div>
        </div>

        <div class="habits-grid">
          @for (entry of entries(); track entry.habitId) {
            <div class="habit-card">
              <div class="habit-card-header">
                <h3>{{ entry.habitName }}</h3>
                <span class="completion-badge">{{ completionPercent(entry) }}%</span>
              </div>

              <div class="habit-card-body">
                <div class="value-display">
                  <span class="current-value">{{ entry.value }}</span>
                  <span class="unit">/ {{ entry.dailyTarget }} {{ entry.unit }}</span>
                </div>

                <div class="progress-bar-container">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="completionPercent(entry)"
                  ></div>
                </div>

                <div class="controls">
                  <button
                    class="btn btn-decrement"
                    (click)="onDecrement(entry)"
                    [disabled]="entry.value <= 0"
                  >
                    -1
                  </button>

                  <form [formGroup]="getForm(entry.habitId)" class="value-form">
                    <input
                      type="number"
                      formControlName="value"
                      min="0"
                      class="value-input"
                      (change)="onValueInputChange(entry)"
                    />
                  </form>

                  <button
                    class="btn btn-increment"
                    (click)="onIncrement(entry)"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
        background-color: #f5f5f5;
        min-height: 100vh;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .dashboard-header h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }

      .date-picker {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .date-picker label {
        font-weight: 500;
        color: #555;
      }

      .date-picker input {
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        background: #fff;
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

      .total-progress {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 24px;
      }

      .total-progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .progress-bar-container {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: #1976d2;
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .habits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }

      .habit-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
      }

      .habit-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .habit-card-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }

      .completion-badge {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .habit-card-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .value-display {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .current-value {
        font-size: 24px;
        font-weight: 700;
        color: #1976d2;
      }

      .unit {
        font-size: 14px;
        color: #666;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn {
        padding: 6px 14px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .btn:hover:not(:disabled) {
        background: #f0f0f0;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-increment {
        color: #1976d2;
        border-color: #1976d2;
      }

      .btn-increment:hover:not(:disabled) {
        background: #e3f2fd;
      }

      .value-form {
        flex: 1;
      }

      .value-input {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        text-align: center;
      }

      .value-input:focus {
        outline: none;
        border-color: #1976d2;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private habitService = inject(HabitService);
  private fb = inject(FormBuilder);

  selectedDate = signal<string>(this.getToday());
  entries = signal<DailyEntry[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  forms = signal<Record<number, FormGroup>>({});

  totalProgress = computed(() => {
    const items = this.entries();
    if (items.length === 0) return 0;
    const total = items.reduce((sum, e) => sum + this.completionPercent(e), 0);
    return Math.round(total / items.length);
  });

  ngOnInit(): void {
    this.loadEntries();
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadEntries(): void {
    this.loading.set(true);
    this.error.set(null);

    this.habitService.getDailyEntries(this.selectedDate()).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.buildForms(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load entries. Please try again.');
        this.loading.set(false);
        console.error('Failed to load entries:', err);
      },
    });
  }

  private buildForms(data: DailyEntry[]): void {
    const formMap: Record<number, FormGroup> = {};
    for (const entry of data) {
      formMap[entry.habitId] = this.fb.group({
        value: [entry.value],
      });
    }
    this.forms.set(formMap);
  }

  getForm(habitId: number): FormGroup {
    return this.forms()[habitId];
  }

  completionPercent(entry: DailyEntry): number {
    if (entry.dailyTarget <= 0) return 0;
    return Math.min(100, Math.round((entry.value / entry.dailyTarget) * 100));
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate.set(input.value);
      this.loadEntries();
    }
  }

  onIncrement(entry: DailyEntry): void {
    const newValue = entry.value + 1;
    this.updateEntry(entry, newValue);
  }

  onDecrement(entry: DailyEntry): void {
    if (entry.value <= 0) return;
    const newValue = entry.value - 1;
    this.updateEntry(entry, newValue);
  }

  onValueInputChange(entry: DailyEntry): void {
    const form = this.getForm(entry.habitId);
    const rawValue = form.get('value')?.value;
    const newValue = Math.max(0, Number(rawValue) || 0);
    this.updateEntry(entry, newValue);
  }

  private updateEntry(entry: DailyEntry, newValue: number): void {
    this.habitService
      .setEntryValue(entry.habitId, this.selectedDate(), newValue)
      .subscribe({
        next: (updated) => {
          this.entries.update((list) =>
            list.map((e) => (e.habitId === updated.habitId ? updated : e))
          );
          const form = this.getForm(entry.habitId);
          if (form) {
            form.get('value')?.setValue(updated.value, { emitEvent: false });
          }
        },
        error: (err) => {
          this.error.set('Failed to update value. Please try again.');
          console.error('Failed to update entry:', err);
        },
      });
  }
}
