import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'box-theme';

describe('ThemeService', () => {
  let store: Record<string, string>;

  function installStorage(items: Record<string, string> = {}): void {
    store = { ...items };
    spyOn(localStorage, 'getItem').and.callFake((k: string) =>
      Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((k: string, v: string) => {
      store[k] = v;
    });
  }

  /** Effects run asynchronously, so flush them before asserting on side effects. */
  function flushEffects(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function matchMedia(dark: boolean): void {
    spyOn(window, 'matchMedia').and.returnValue({ matches: dark } as MediaQueryList);
  }

  function createService(): ThemeService {
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('loads a stored light preference', () => {
    installStorage({ [STORAGE_KEY]: 'light' });
    matchMedia(true);

    expect(createService().currentTheme()).toBe('light');
  });

  it('loads a stored dark preference', () => {
    installStorage({ [STORAGE_KEY]: 'dark' });
    matchMedia(false);

    expect(createService().currentTheme()).toBe('dark');
  });

  it('follows the system preference when nothing is stored', () => {
    installStorage();
    matchMedia(true);

    expect(createService().currentTheme()).toBe('dark');
  });

  it('falls back to light when the system has no dark preference', () => {
    installStorage();
    matchMedia(false);

    expect(createService().currentTheme()).toBe('light');
  });

  it('ignores an invalid stored value and uses the system preference', () => {
    installStorage({ [STORAGE_KEY]: 'solarized' });
    matchMedia(true);

    expect(createService().currentTheme()).toBe('dark');
  });

  it('ignores an empty stored value and uses the system preference', () => {
    installStorage({ [STORAGE_KEY]: '' });
    matchMedia(false);

    expect(createService().currentTheme()).toBe('light');
  });

  it('persists the theme to localStorage on change', () => {
    installStorage({ [STORAGE_KEY]: 'light' });
    matchMedia(false);
    const service = createService();

    service.toggle();
    flushEffects();

    expect(store[STORAGE_KEY]).toBe('dark');
  });

  it('applies the theme attribute to the document element', () => {
    installStorage({ [STORAGE_KEY]: 'light' });
    matchMedia(false);
    const service = createService();

    service.setTheme('dark');
    flushEffects();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies the initial theme to the document element', () => {
    installStorage({ [STORAGE_KEY]: 'dark' });
    matchMedia(false);
    createService();
    flushEffects();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles between light and dark', () => {
    installStorage({ [STORAGE_KEY]: 'light' });
    matchMedia(false);
    const service = createService();

    service.toggle();
    flushEffects();
    expect(service.currentTheme()).toBe('dark');

    service.toggle();
    flushEffects();
    expect(service.currentTheme()).toBe('light');
  });

  it('defaults to light on the server', () => {
    installStorage({ [STORAGE_KEY]: 'dark' });
    matchMedia(true);
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'server' }],
    });

    expect(TestBed.inject(ThemeService).currentTheme()).toBe('light');
  });
});
