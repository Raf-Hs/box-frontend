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

              @if (saveFeedback()[habit.id]?.success) {
                <span class="feedback success">Saved!</span>
              }
              @if (saveFeedback()[habit.id]?.error) {
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
        padding: 24px;
        background-color: #f5f5f5;
        min-height: 100vh;
      }

      .habits-header {
        margin-bottom: 24px;
      }

      .habits-header h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
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

      .habits-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .habit-row {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
      }

      .habit-info {
        flex: 1;
        min-width: 150px;
      }

      .habit-info h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #333;
      }

      .habit-unit {
        font-size: 13px;
        color: #888;
      }

      .habit-form {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .habit-form label {
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }

      .target-input {
        width: 100px;
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
      }

      .target-input:focus {
        outline: none;
        border-color: #1976d2;
      }

      .btn-save {
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

      .btn-save:hover:not(:disabled) {
        background: #1565c0;
      }

      .btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .feedback {
        font-size: 13px;
        font-weight: 500;
      }

      .feedback.success {
        color: #2e7d32;
      }

      .feedback.error {
        color: #d32f2f;
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
      err: (err) => {
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
      err: (err) => {
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
