import { TestBed } from '@angular/core/testing';
import { Hotkeys } from './hotkey.service';

describe('HotkeyService', () => {
  let service: Hotkeys;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hotkeys);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should inject shortcuts', () => {
    let triggered = false;
    service.addShortcut({
      keys: 'control+f'
    }).subscribe(() => {
      triggered = true;
    });
    let pressEvent = new KeyboardEvent('keydown', {
      'key': 'control+f'
    });
    document.dispatchEvent(pressEvent);
    expect(triggered).toBe(true);
  });
});
