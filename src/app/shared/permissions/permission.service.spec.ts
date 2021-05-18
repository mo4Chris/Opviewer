import { TestBed } from "@angular/core/testing";
import { UserType } from "../enums/UserType";
import { MockedUserServiceProvider, UserTestService } from "../services/test.user.service";
import { PermissionService } from "./permission.service";


describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedUserServiceProvider,
      ],
      imports : []
    });
  });

  it('should init', () => {
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
  })

  it('should init as admin', () => {
    mockUserModel('admin');
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
    expect(service.admin).toBe(true);
    expect(service.userRead).toBe(true);
    expect(service.userCreate).toBe(true);
    expect(service.userManage).toBe(true);
    expect(service.ctvVideoRequest).toBe(true);
    expect(service.longterm).toBe(true);
    expect(service.sovCommercialRead).toBe(true);
    expect(service.sovCommercialWrite).toBe(true);
  })

  it('should init as logistic specialist', () => {
    mockUserModel('Logistics specialist');
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
    expect(service.admin).toBe(false);
    expect(service.userRead).toBe(true);
    expect(service.userCreate).toBe(true);
    expect(service.userManage).toBe(true);
    expect(service.ctvVideoRequest).toBe(true);
    expect(service.longterm).toBe(true);
    expect(service.sovSiemensMonthlyKpis).toBe(false);
  })

  it('should init as marine controller', () => {
    mockUserModel('Marine controller');
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
    expect(service.admin).toBe(false);
    expect(service.userRead).toBe(true);
    expect(service.userCreate).toBe(false);
    expect(service.userManage).toBe(false);
    expect(service.ctvVideoRequest).toBe(true);
    expect(service.longterm).toBe(true);
  })

  it('should init as vessel master', () => {
    mockUserModel('Vessel master');
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
    expect(service.admin).toBe(false);
    expect(service.userRead).toBe(false);
    expect(service.userCreate).toBe(false);
    expect(service.userManage).toBe(false);
    expect(service.ctvVideoRequest).toBe(false);
    expect(service.longterm).toBe(false);
  })

  it('should show siemens KPIs for bibby LS', () => {
    mockUserModel('Logistics specialist', 'Bibby Marine')
    service = TestBed.inject(PermissionService);
    expect(service).toBeTruthy();
    expect(service.sovSiemensMonthlyKpis).toBe(true);
  })

});

function mockUserModel(userType: UserType, company='Test_Company') {
  spyOn(UserTestService.prototype, 'getDecodedAccessToken').and.returnValue(
    UserTestService.getMockedAccessToken({
      userPermission: userType,
      userCompany: company,
    })
  )
}
