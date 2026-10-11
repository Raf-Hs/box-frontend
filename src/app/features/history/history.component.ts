import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/habit.service';
import { DailyEntry } from '../../models/habit.model';

type RangePreset = '7d' | '30d' | '90d' | 'custom';

const PRESET_DAYS: Record<Exclude<RangePreset, 'custom'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container animate-fade-in">
      <header class="history-header">
        <h1>History</h1>
        <p class="history-subtitle">Tracked values by habit and date.</p>
      </header>

      <section class="card range-section" aria-labelledby="range-heading">
        <h2 id="range-heading" class="section-title">Period</h2>
        <div class="range-buttons" role="group" aria-label="Date range presets">
          @for (preset of presets; track preset.value) {
            <button
              type="button"
              class="btn"
              [class.btn-primary]="selectedPreset() === preset.value"
              [attr.aria-pressed]="selectedPreset() === preset.value"
              (click)="selectPreset(preset.value)"
            >
              {{ preset.label }}
            </button>
          }
        </div>

        @if (selectedPreset() === 'custom') {
          <div class="custom-range animate-fade-in">
            <div class="date-field">
              <label for="history-from-date">From</label>
              <input
                id="history-from-date"
                type="date"
                class="input"
                [value]="fromDate()"
                (change)="onFromDateChange($event)"
              />
            </div>
            <div class="date-field">
              <label for="history-to-date">To</label>
              <input
                id="history-to-date"
                type="date"
                class="input"
                [value]="toDate()"
                (change)="onToDateChange($event)"
              />
            </div>
          </div>
        }

        <p class="range-summary">{{ fromDate() }} to {{ toDate() }}</p>
      </section>

      @if (rangeError()) {
        <div class="state-message error" role="alert">{{ rangeError() }}</div>
      } @else if (loading()) {
        <div class="state-message" role="status" aria-live="polite">Loading history...</div>
      } @else if (error()) {
        <div class="state-message error" role="alert">
          <p>{{ error() }}</p>
          <button type="button" class="btn" (click)="loadHistory()">Try again</button>
        </div>
      } @else if (history().length === 0) {
        <div class="state-message" role="status">No history found for this period.</div>
      } @else {
        <section class="history-list" aria-label="History entries">
          @for (entry of history(); track entry.habitId + '-' + entry.date) {
            <article class="card history-card">
              <div class="history-card-header">
                <h3 class="habit-name">{{ entry.habitName }}</h3>
                <time class="entry-date" [attr.datetime]="entry.date">{{ entry.date }}</time>
              </div>
              <div class="value-display">
                <span class="current-value">{{ entry.value }}</span>
                <span class="unit">/ {{ entry.dailyTarget }} {{ entry.unit }}</span>
              </div>
              <div
                class="progress-bar-container"
                role="progressbar"
                [attr.aria-valuenow]="completionPercent(entry)"
                aria-valuemin="0"
                aria-valuemax="100"
                [attr.aria-label]="entry.habitName + ' on ' + entry.date"
              >
                <div class="progress-bar-fill" [style.width.%]="completionPercent(entry)"></div>
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      .history-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .history-header h1 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-text);
      }

      .history-subtitle {
        margin-top: var(--space-xs);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .section-title {
        margin: 0 0 var(--space-md) 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .range-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .range-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      .custom-range {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
      }

      .date-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .date-field label {
        font-size: var(--font-size-xs);
        font-weight: 500;
        color: var(--color-text-secondary);
      }

      .range-summary {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }

      .history-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: var(--space-md);
      }

      .history-card {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md);
      }

      .history-card-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--space-sm);
      }

      .habit-name {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text);
      }

      .entry-date {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
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

      .state-message p {
        margin-bottom: var(--space-md);
      }

      @media (max-width: 600px) {
        .history-container {
          padding: var(--space-md);
        }
      }
    `,
  ],
})
export class HistoryComponent implements OnInit {
  private habitService = inject(HabitService);

  readonly presets: { value: RangePreset; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom' },
  ];

  selectedPreset = signal<RangePreset>('30d');
  fromDate = signal<string>(this.presetFrom(30));
  toDate = signal<string>(this.formatDate(new Date()));
  history = signal<DailyEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  rangeError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  selectPreset(preset: RangePreset): void {
    this.selectedPreset.set(preset);
    if (preset !== 'custom') {
      this.fromDate.set(this.presetFrom(PRESET_DAYS[preset]));
      this.toDate.set(this.formatDate(new Date()));
      this.loadHistory();
    }
  }

  onFromDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.fromDate.set(value);
      this.loadHistory();
    }
  }

  onToDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.toDate.set(value);
      this.loadHistory();
    }
  }

  loadHistory(): void {
    const from = this.fromDate();
    const to = this.toDate();

    if (from > to) {
      this.rangeError.set("The 'From' date must be on or before the 'To' date.");
      this.history.set([]);
      this.loading.set(false);
      return;
    }

    this.rangeError.set(null);
    this.loading.set(true);
    this.error.set(null);

    this.habitService.getHistory(from, to).subscribe({
      next: (data) => {
        this.history.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.history.set([]);
        this.error.set('Failed to load history. Please try again.');
        this.loading.set(false);
        console.error('Failed to load history:', err);
      },
    });
  }

  completionPercent(entry: DailyEntry): number {
    if (entry.dailyTarget <= 0) return 0;
    return Math.min(100, Math.round((entry.value / entry.dailyTarget) * 100));
  }

  /** Inclusive range: a 7-day preset covers today and the 6 days before it. */
  private presetFrom(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1));
    return this.formatDate(date);
  }

  /** Formats a Date as YYYY-MM-DD in the browser's local timezone. */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
