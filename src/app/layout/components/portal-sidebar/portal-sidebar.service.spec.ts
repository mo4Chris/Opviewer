import { TestBed } from '@angular/core/testing';

import { PortalSidebarService, sidebarContentType } from './portal-sidebar.service';
import { PermissionModel, PermissionService } from '@app/shared/permissions/permission.service';

describe('PortalSidebarService', () => {
  let service: PortalSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortalSidebarService);
  });

  describe('getContentWithPermission', () => {
    it('should return content based on permission level', () => {
      const permission = { demo: true } as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Admin page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['admin']
        },
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['demo']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);

      const answer = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['demo']
        },
      ];

      expect(adjustedContent).toEqual(answer);
    });

    it('should return content if the required permission is default', () => {
      const permission = { demo: true } as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['default']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);

      expect(adjustedContent).toEqual(content);
    });
  });
});
