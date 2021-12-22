import { PortalSidebarService, sidebarContentType } from './portal-sidebar.service';
import { PermissionModel } from '@app/shared/permissions/permission.service';

describe('PortalSidebarService', () => {
  let service: PortalSidebarService;

  beforeEach(() => {
    service = new PortalSidebarService;
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

    it('should return list of content if the licenceType is "LIGHT ', () => {
      const permission = { licenceType: 'LIGHT' } as unknown as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['licenceType']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);

      expect(adjustedContent).toEqual(content);
    });
    it('should return list of content if the licenceType is "PRO ', () => {
      const permission = { licenceType: 'PRO' } as unknown as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['licenceType']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);

      expect(adjustedContent).toEqual(content);
    });
    it('should not return list of content if the licenceType is "NO_LICENCE"', () => {
      const permission = { licenceType: 'NO_LICENCE' } as unknown as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['licenceType']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);
      const expected = [];

      expect(adjustedContent).toEqual(expected);
    });

    it('should not return list of content if the licenceType is not there ', () => {
      const permission = {} as PermissionModel;
      const content = [
        {
          type: sidebarContentType.Top,
          label: 'Demo page',
          icon: '',
          destination: '',
          requiredPermissionsOr: ['licenceType']
        },
      ];

      const adjustedContent = service.getContentWithPermission(permission, content);
      const expected = [];

      expect(adjustedContent).toEqual(expected);
    });
  });
});
