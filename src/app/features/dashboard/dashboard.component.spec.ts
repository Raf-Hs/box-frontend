import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { DashboardComponent } from './dashboard.component';

const API = 'http://localhost:5000/api';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
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

  function flushEntries(entries: unknown[]): void {
    const req = httpMock.expectOne((r) => r.url === `${API}/daily-entries`);
    req.flush(entries);
    fixture.detectChanges();
  }

  const entry = {
    habitId: 1,
    habitName: 'Sleep',
    unit: 'Hours',
    date: '2026-10-11',
    value: 6,
    dailyTarget: 8,
  };

  it('creates and requests the selected date', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    flushEntries([entry]);
    httpMock.verify();
  });

  it('shows a loading state while the request is pending', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Loading...');

    flushEntries([entry]);
  });

  it('shows an error state when the request fails', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === `${API}/daily-entries`);
    req.error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Failed to load entries');
  });

  it('shows an empty state when the day has no entries', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    flushEntries([]);

    expect(fixture.nativeElement.textContent).toContain('No entries for this date.');
  });

  it('renders habit cards with progress when data returns', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    flushEntries([entry]);

    expect(fixture.nativeElement.textContent).toContain('Sleep');
    expect(fixture.componentInstance.totalProgress()).toBe(75);
  });

  it('caps completion at 100 percent when the target is exceeded', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    flushEntries([{ ...entry, value: 20 }]);

    expect(fixture.componentInstance.completionPercent({ ...entry, value: 20 })).toBe(100);
  });

  it('handles a zero target without dividing by zero', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    flushEntries([{ ...entry, dailyTarget: 0 }]);

    expect(fixture.componentInstance.completionPercent({ ...entry, dailyTarget: 0 })).toBe(0);
  });

  it('uses the local calendar date as the selected day', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 0, 8, 23, 59, 59));

    try {
      fixture = TestBed.createComponent(DashboardComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedDate()).toBe('2026-01-08');

      const req = httpMock.expectOne((r) => r.url === `${API}/daily-entries`);
      expect(req.request.params.get('date')).toBe('2026-01-08');

      req.flush([entry]);
      fixture.detectChanges();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('still renders after a theme change', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    flushEntries([entry]);

    TestBed.inject(ThemeService).setTheme('dark');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sleep');
  });
});
