import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import * as moment from 'moment-timezone';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
      ],
    })
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return token correctly', () => {
    spyOn(moment.prototype, 'valueOf').and.returnValue(1623679752188 - 1)
    const test_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
    eyJ1c2VySUQiOjU5LCJ1c2VyUGVybWlzc2lvbiI6IlZlc3NlbCBtYXN0ZX
    IiLCJ1c2VyQ29tcGFueSI6Ik1PNCIsInVzZXJCb2F0cyI6bnVsbCwidXNl
    cm5hbWUiOiJtYXN0ZXJzb3ZAYm1vLW9mZnNob3JlLmNvbSIsImNsaWVudF
    9pZCI6MSwicGVybWlzc2lvbiI6eyJhZG1pbiI6ZmFsc2UsInVzZXJfcmVh
    ZCI6ZmFsc2UsImRlbW8iOmZhbHNlLCJ1c2VyX21hbmFnZSI6ZmFsc2UsIn
    R3YSI6eyJyZWFkIjpmYWxzZX0sImRwciI6eyJyZWFkIjp0cnVlLCJzb3Zf
    aW5wdXQiOiJyZWFkIiwic292X2NvbW1lcmNpYWwiOiJyZWFkIiwic292X2
    hzZSI6IndyaXRlIn0sImxvbmd0ZXJtIjp7InJlYWQiOmZhbHNlfSwidXNl
    cl90eXBlIjoiVmVzc2VsIG1hc3RlciIsImZvcmVjYXN0Ijp7InJlYWQiOm
    ZhbHNlLCJjaGFuZ2VMaW1pdHMiOmZhbHNlLCJjcmVhdGVQcm9qZWN0Ijpm
    YWxzZX0sInVzZXJfc2VlX2FsbF92ZXNzZWxzX2NsaWVudCI6ZmFsc2V9LC
    JleHBpcmVzIjoxNjIzNjc5NzUyMTg4LCJpYXQiOjE2MjEwMDEzNTJ9.4x1
    doYMGg63Blf1ZDtgagIO2vJwhvuz80yGCY8xmdvI`
    const decoded = service.getDecodedAccessToken(test_token);
    expect(decoded).toBeTruthy();
    expect(decoded.username).toEqual('mastersov@bmo-offshore.com')
  })

  it('should not return token - expired', () => {
    spyOn(moment.prototype, 'valueOf').and.returnValue(1623679752188 + 1)
    const routingSpy = spyOn(service.router, 'navigate');
    const test_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
    eyJ1c2VySUQiOjU5LCJ1c2VyUGVybWlzc2lvbiI6IlZlc3NlbCBtYXN0ZX
    IiLCJ1c2VyQ29tcGFueSI6Ik1PNCIsInVzZXJCb2F0cyI6bnVsbCwidXNl
    cm5hbWUiOiJtYXN0ZXJzb3ZAYm1vLW9mZnNob3JlLmNvbSIsImNsaWVudF
    9pZCI6MSwicGVybWlzc2lvbiI6eyJhZG1pbiI6ZmFsc2UsInVzZXJfcmVh
    ZCI6ZmFsc2UsImRlbW8iOmZhbHNlLCJ1c2VyX21hbmFnZSI6ZmFsc2UsIn
    R3YSI6eyJyZWFkIjpmYWxzZX0sImRwciI6eyJyZWFkIjp0cnVlLCJzb3Zf
    aW5wdXQiOiJyZWFkIiwic292X2NvbW1lcmNpYWwiOiJyZWFkIiwic292X2
    hzZSI6IndyaXRlIn0sImxvbmd0ZXJtIjp7InJlYWQiOmZhbHNlfSwidXNl
    cl90eXBlIjoiVmVzc2VsIG1hc3RlciIsImZvcmVjYXN0Ijp7InJlYWQiOm
    ZhbHNlLCJjaGFuZ2VMaW1pdHMiOmZhbHNlLCJjcmVhdGVQcm9qZWN0Ijpm
    YWxzZX0sInVzZXJfc2VlX2FsbF92ZXNzZWxzX2NsaWVudCI6ZmFsc2V9LC
    JleHBpcmVzIjoxNjIzNjc5NzUyMTg4LCJpYXQiOjE2MjEwMDEzNTJ9.4x1
    doYMGg63Blf1ZDtgagIO2vJwhvuz80yGCY8xmdvI`
    const decoded = service.getDecodedAccessToken(test_token);
    expect(decoded).not.toBeTruthy();
    expect(routingSpy).toHaveBeenCalled();
  })
});
