import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HabitService } from '../../core/habit.service';
import { Habit } from '../../models/habit.model';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="habits-container">
      <header class="habits-header">
        <h1>Habits</h1>
      </header>

      @if (loading()) {
        <div class="state-message">Loading...</div>
      } @else if (error()) {
        <div class="state-message error">{{ error() }}</div>
      } @else {
        <div class="habits-list">
          @for (habit of habits(); track habit.id) {
            <div class="habit-row">
              <div class="habit-info">
                <h3>{{ habit.name }}</h3>
                <span class="habit-unit">{{ habit.unit }}</span>
              </div>

              <form [formGroup]="getForm(habit.id)" class="habit-form">
                <label [for]="'target-' + habit.id">Daily Target:</label>
                <input
                  type="number"
                  [id]="'target-' + habit.id"
                  formControlName="dailyTarget"
                  min="1"
                  class="target-input"
                />
                <button
                  type="button"
                  class="btn btn-save"
                  (click)="onSave(habit)"
                  [disabled]="getForm(habit.id).invalid || isSaving()[habit.id]"
                >
                  {{ isSaving()[habit.id] ? 'Saving...' : 'Save' }}
                </button>
              </form>

              @if (saveFeedback()[habit.id] && saveFeedback()[habit.id].success) {
                <span class="feedback success">Saved!</span>
              }
              @if (saveFeedback()[habit.id] && saveFeedback()[habit.id].error) {
                <span class="feedback error">{{ saveFeedback()[habit.id].error }}</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .habits-container {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--space-lg);
        background-color: var(--color-bg);
        min-height: 100vh;
      }

      .habits-header {
        margin-bottom: var(--space-lg);
      }

      .habits-header h1 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-text);
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

      .habits-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .habit-row {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
        transition: box-shadow var(--transition-fast);
      }

      .habit-row:hover {
        box-shadow: var(--shadow-md);
      }

      .habit-info {
        flex: 1;
        min-width: 150px;
      }

      .habit-info h3 {
        margin: 0 0 var(--space-xs) 0;
        font-size: var(--font-size-sm);
        color: var(--color-text);
      }

      .habit-unit {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }

      .habit-form {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .habit-form label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-secondary);
      }

      .target-input {
        width: 100px;
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        background: var(--color-surface);
        color: var(--color-text);
        transition: border-color var(--transition-fast);
      }

      .target-input:focus {
        outline: none;
        border-color: var(--color-border-focus);
      }

      .btn-save {
        padding: var(--space-sm) var(--space-lg);
        background: var(--color-primary);
        color: var(--color-on-primary);
        border: none;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        font-weight: 500;
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .btn-save:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      .btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .feedback {
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .feedback.success {
        color: var(--color-success);
      }

      .feedback.error {
        color: var(--color-error);
      }
    `,
  ],
})
export class HabitsComponent implements OnInit {
  private habitService = inject(HabitService);
  private fb = inject(FormBuilder);

  habits = signal<Habit[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  forms = signal<Record<number, FormGroup>>({});
  isSaving = signal<Record<number, boolean>>({});
  saveFeedback = signal<Record<number, { success?: boolean; error?: string }>>({});

  ngOnInit(): void {
    this.loadHabits();
  }

  private loadHabits(): void {
    this.loading.set(true);
    this.error.set(null);

    this.habitService.getHabits().subscribe({
      next: (data) => {
        this.habits.set(data);
        this.buildForms(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load habits. Please try again.');
        this.loading.set(false);
        console.error('Failed to load habits:', err);
      },
    });
  }

  private buildForms(data: Habit[]): void {
    const formMap: Record<number, FormGroup> = {};
    for (const habit of data) {
      formMap[habit.id] = this.fb.group({
        dailyTarget: [habit.dailyTarget],
      });
    }
    this.forms.set(formMap);
  }

  getForm(habitId: number): FormGroup {
    return this.forms()[habitId];
  }

  onSave(habit: Habit): void {
    const form = this.getForm(habit.id);
    if (form.invalid) return;

    const newTarget = Math.max(1, Number(form.get('dailyTarget')?.value) || 1);

    this.isSaving.update((s) => ({ ...s, [habit.id]: true }));
    this.saveFeedback.update((f) => ({ ...f, [habit.id]: {} }));

    this.habitService.updateTarget(habit.id, newTarget).subscribe({
      next: (updated) => {
        this.habits.update((list) =>
          list.map((h) => (h.id === updated.id ? updated : h))
        );
        this.isSaving.update((s) => ({ ...s, [habit.id]: false }));
        this.saveFeedback.update((f) => ({
          ...f,
          [habit.id]: { success: true },
        }));

        setTimeout(() => {
          this.saveFeedback.update((f) => ({ ...f, [habit.id]: {} }));
        }, 3000);
      },
      error: (err) => {
        this.isSaving.update((s) => ({ ...s, [habit.id]: false }));
        this.saveFeedback.update((f) => ({
          ...f,
          [habit.id]: { error: 'Failed to save. Try again.' },
        }));
        console.error('Failed to update target:', err);
      },
    });
  }
}
