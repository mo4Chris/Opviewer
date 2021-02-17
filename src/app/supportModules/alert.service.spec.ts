import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });
  afterEach(()=> {
    service.clear();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.active).toBe(false)
  });

  it('default to success alert', () => {
    service.sendAlert({text: 'Test'});
    expect(service.timeout).toBeGreaterThan(0);
    expect(service.type).toBe('success')
    expect(service.active).toBe(true)
  })

  it('not overwrite important alerts', () => {
    service.sendAlert({text: 'error', type: 'danger'});
    service.sendAlert({text: 'nope', type: 'success'});
    expect(service.text).toBe('error');
    expect(service.type).toBe('danger');
    expect(service.active).toBe(true)
  })

  it('should clear', () => {
    service.sendAlert({text: 'error', type: 'danger'});
    expect(service.active).toBe(true)
    expect(service['timeoutRef']).toBeTruthy();
    service.clear()
    expect(service.active).toBe(false)
    expect(service['timeoutRef']).not.toBeTruthy();
  })
})

