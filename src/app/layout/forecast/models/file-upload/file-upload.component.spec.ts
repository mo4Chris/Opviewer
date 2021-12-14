import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ISelectedFile, IUploadProgress, NgxUploaderDirectiveModule } from 'ngx-uploader-directive';
import { testEmptyTooltips } from '../../forecast-new-vessel/forecast-new-vessel.component.spec';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
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
    component['uploadUrl' ] = 'http://192.168.192.1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render', async () => {
    await fixture.whenStable();
    const dropfield = locate('div[ngxFileDrop]');
    expect(dropfield).toBeTruthy();
    const uploadBtn = locate('input[ngxFileSelect]');
    expect(uploadBtn).toBeTruthy();
  });

  it('should emit event when upload is complete', async () => {
    const emitSpy = spyOn(component.fileUploadComplete, 'emit');
    component.onUploadOutput({type: 'done', files: [MockedFile], progress: MockedProgress});
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not have logs enabled', () => {
    expect(component.options.logs).not.toBeTruthy();
  });

  it('should commence upload', async () => {
    const uploadSpy = spyOn(HttpClient.prototype, 'request').and.callFake((req) => {
      // ToDo: this spy should be triggered
    });
    await fixture.whenStable();
    initTestFile();
    fixture.detectChanges();

    component.startUpload();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    // ToDo
    // expect(uploadSpy).toHaveBeenCalled();
  });

  it('should reset on rejected file', async () => {
    initTestFile();
    await fixture.whenStable();
    expect(component.filename).toEqual('test.txt');
    // ToDo: replace with rejectall
    component.onUploadOutput({
      type: 'removedAll'
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.filename).not.toBeTruthy();
  });

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture));

  // --------- HELPERS --------------- //
  function locate(locator: string) {
    return fixture.nativeElement.querySelector(locator);
  }
  function initTestFile() {
    // ToDo: Need to properly simulate the file drop events, as the
    // current implementation does not actually upload files.
    component.onUploadOutput({
      type: 'init',
    });
    fixture.detectChanges();
    const testFile: ISelectedFile = {
      name: 'test.txt',
      nativeFile: new File(['A'], 'test.txt'),
      fileIndex: 1,
      selectedEventType: 'DROP',
      type: 'test',
      requestId: 'test_id',
    };
    component.onUploadOutput({
      files: [testFile],
      type: 'addedToQueue',
    });
    fixture.detectChanges();
  }
});

const MockedFile: ISelectedFile = {
  name: 'test',
  type: 'test',
  fileIndex: 123,
  requestId: '1234',
  selectedEventType: 'DROP'
};

const MockedProgress: IUploadProgress = {
  status: 'Done'
};
