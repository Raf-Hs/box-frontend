import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { HistoryComponent } from './history.component';

const API = 'http://localhost:5000/api';

describe('HistoryComponent', () => {
  let fixture: ComponentFixture<HistoryComponent>;
  let httpMock: HttpTestingController;
  let component: HistoryComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function create(): void {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function flushHistory(entries: unknown[] = []): void {
    const req = httpMock.expectOne((r) => r.url === `${API}/daily-entries/history`);
    req.flush(entries);
    fixture.detectChanges();
  }

  /** Finds the retry button rendered inside the error state. */
  function retryButton(): HTMLButtonElement {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const button = buttons.find((b: HTMLButtonElement) =>
      b.textContent?.includes('Try again')
    );
    expect(button).toBeTruthy();
    return button as HTMLButtonElement;
  }

  const entry = {
    habitId: 1,
    habitName: 'Sleep',
    unit: 'Hours',
    date: '2026-10-11',
    value: 6,
    dailyTarget: 8,
  };

  function historyRequests(): number {
    let count = 0;
    try {
      httpMock.match((r) => r.url === `${API}/daily-entries/history`).forEach(() => count++);
    } catch {
      // No outstanding request for this predicate.
    }
    return count;
  }

  it('creates and loads history on init', () => {
    create();
    expect(component).toBeTruthy();
    flushHistory([entry]);
  });

  it('shows a loading state while the request is pending', () => {
    create();
    expect(fixture.nativeElement.textContent).toContain('Loading history...');
    flushHistory([entry]);
  });

  it('shows an error state when the request fails and offers a retry', () => {
    create();
    httpMock
      .expectOne((r) => r.url === `${API}/daily-entries/history`)
      .error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Failed to load history');

    expect(retryButton()).toBeTruthy();
  });

  it('re-issues the request when the retry button is clicked', () => {
    create();
    httpMock
      .expectOne((r) => r.url === `${API}/daily-entries/history`)
      .error(new ProgressEvent('network error'));
    fixture.detectChanges();

    const retry = retryButton();
    retry.click();
    fixture.detectChanges();

    expect(component.loading()).toBeTrue();
    flushHistory([]);
    expect(component.error()).toBeNull();
  });

  it('shows an empty state when the range has no entries', () => {
    create();
    flushHistory([]);

    expect(fixture.nativeElement.textContent).toContain('No history found for this period.');
  });

  it('renders entry cards when data returns', () => {
    create();
    flushHistory([entry]);

    expect(fixture.nativeElement.textContent).toContain('Sleep');
    expect(fixture.nativeElement.textContent).toContain('2026-10-11');
  });

  it('does not send a request when From is after To', () => {
    create();
    flushHistory([]);

    component.fromDate.set('2026-10-11');
    component.toDate.set('2026-10-01');
    component.loadHistory();
    fixture.detectChanges();

    expect(component.rangeError()).toBeTruthy();
    expect(historyRequests()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('From date must be on or before To date.');
  });

  it('clears the range error once the range becomes valid', () => {
    create();
    flushHistory([]);

    component.fromDate.set('2026-10-11');
    component.toDate.set('2026-10-01');
    component.loadHistory();
    expect(component.rangeError()).toBeTruthy();

    component.fromDate.set('2026-10-01');
    component.toDate.set('2026-10-11');
    component.loadHistory();
    expect(component.rangeError()).toBeNull();

    flushHistory([]);
  });

  it('uses an inclusive 7-day range ending today', () => {
    create();
    flushHistory([]);

    component.selectPreset('7d');

    const req = httpMock.expectOne((r) => r.url === `${API}/daily-entries/history`);
    const params = req.request.params;
    expect(params.get('from')).toBe(component.fromDate());
    expect(params.get('to')).toBe(component.toDate());

    const dayMs = 24 * 60 * 60 * 1000;
    const span = (new Date(component.toDate()).getTime() - new Date(component.fromDate()).getTime()) / dayMs;
    expect(span).toBe(6);
  });

  it('still renders after a theme change', () => {
    create();
    flushHistory([entry]);

    TestBed.inject(ThemeService).setTheme('dark');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sleep');
  });
});
