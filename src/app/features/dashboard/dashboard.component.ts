import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HabitService } from '../../core/habit.service';
import { Habit, DailyEntry } from '../../models/habit.model';
import { todayLocal } from '../../core/date.utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container animate-fade-in">
      <header class="dashboard-header">
        <h1>BOX</h1>
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
        padding: var(--space-lg);
        background-color: var(--color-bg);
        min-height: 100vh;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-lg);
      }

      .dashboard-header h1 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-text);
      }

      .date-picker {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .date-picker label {
        font-weight: 500;
        color: var(--color-text-secondary);
      }

      .date-picker input {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        background: var(--color-surface);
        color: var(--color-text);
        transition: border-color var(--transition-fast);
      }

      .date-picker input:focus {
        outline: none;
        border-color: var(--color-border-focus);
      }

      .state-message {
        text-align: center;
        padding: var(--space-2xl);
        color: var(--color-text-muted);
        font-size: var(--font-size-base);
      }

      .state-message.error {
        color: var(--color-error);
      }

      .total-progress {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        margin-bottom: var(--space-lg);
      }

      .total-progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-sm);
        font-weight: 500;
        color: var(--color-text);
      }

      .progress-bar-container {
        width: 100%;
        height: 8px;
        background: var(--color-border);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: var(--color-primary);
        border-radius: var(--radius-full);
        transition: width var(--transition-slow);
      }

      .habits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-md);
      }

      .habit-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        transition: box-shadow var(--transition-fast);
      }

      .habit-card:hover {
        box-shadow: var(--shadow-md);
      }

      .habit-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-sm);
      }

      .habit-card-header h3 {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text);
      }

      .completion-badge {
        background: var(--color-primary-light);
        color: var(--color-primary);
        padding: 2px var(--space-sm);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: 600;
      }

      .habit-card-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .value-display {
        display: flex;
        align-items: baseline;
        gap: var(--space-xs);
      }

      .current-value {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-primary);
      }

      .unit {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .controls {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .btn {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-surface);
        color: var(--color-text);
        cursor: pointer;
        font-size: var(--font-size-sm);
        font-weight: 500;
        transition: all var(--transition-fast);
      }

      .btn:hover:not(:disabled) {
        background: var(--color-surface-hover);
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-increment {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }

      .btn-increment:hover:not(:disabled) {
        background: var(--color-primary-light);
      }

      .value-form {
        flex: 1;
      }

      .value-input {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        text-align: center;
        background: var(--color-surface);
        color: var(--color-text);
        transition: border-color var(--transition-fast);
      }

      .value-input:focus {
        outline: none;
        border-color: var(--color-border-focus);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private habitService = inject(HabitService);
  private fb = inject(FormBuilder);

  selectedDate = signal<string>(todayLocal());
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
