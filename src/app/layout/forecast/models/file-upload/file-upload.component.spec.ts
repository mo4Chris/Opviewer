import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ISelectedFile, IUploadProgress, NgxUploaderDirectiveModule } from 'ngx-uploader-directive';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxUploaderDirectiveModule
      ],
      declarations: [
        FileUploadComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should render', async () => {
    await fixture.whenStable();
    let dropfield = locate('div[ngxFileDrop]')
    expect(dropfield).toBeTruthy();
    let uploadBtn = locate('input[ngxFileSelect]')
    expect(uploadBtn).toBeTruthy();
  });

  it('should emit event when upload is complete', async () => {
    let emitSpy = spyOn(component.fileUploadComplete, 'emit')
    component.onUploadOutput({type: 'done', files: [MockedFile], progress: MockedProgress})
    expect(emitSpy).toHaveBeenCalled();
  });

  function locate(locator: string) {
    return fixture.nativeElement.querySelector(locator);
  }
});

const MockedFile: ISelectedFile = {
  name: 'test',
  type: 'test',
  fileIndex: 123,
  requestId: '1234',
  selectedEventType: 'DROP'
}

const MockedProgress: IUploadProgress = {
  status: 'Done'
}