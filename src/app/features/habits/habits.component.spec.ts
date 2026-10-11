import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { HabitsComponent } from './habits.component';

const API = 'http://localhost:5000/api';

describe('HabitsComponent', () => {
  let fixture: ComponentFixture<HabitsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HabitsComponent],
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

  function flushHabits(habits: unknown[]): void {
    const req = httpMock.expectOne((r) => r.url === `${API}/habits`);
    req.flush(habits);
    fixture.detectChanges();
  }

  const habit = { id: 1, name: 'Sleep', unit: 'Hours', dailyTarget: 8, isActive: true };

  it('creates and requests the habit list', () => {
    fixture = TestBed.createComponent(HabitsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    flushHabits([habit]);
  });

  it('shows a loading state while the request is pending', () => {
    fixture = TestBed.createComponent(HabitsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading...');
    flushHabits([habit]);
  });

  it('shows an error state when the request fails', () => {
    fixture = TestBed.createComponent(HabitsComponent);
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url === `${API}/habits`)
      .error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Failed to load habits');
  });

  it('renders each habit with a target input', () => {
    fixture = TestBed.createComponent(HabitsComponent);
    fixture.detectChanges();
    flushHabits([habit]);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sleep');
    expect(text).toContain('Hours');
    expect(fixture.nativeElement.querySelector('input[type="number"]')).toBeTruthy();
  });

  it('still renders after a theme change', () => {
    fixture = TestBed.createComponent(HabitsComponent);
    fixture.detectChanges();
    flushHabits([habit]);

    TestBed.inject(ThemeService).setTheme('dark');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sleep');
  });
});
