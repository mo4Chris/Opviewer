import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from '@app/supportModules/alert.service';
import { IUploadOptions, ISelectedFile, IUploadInput, IUploadOutput, IUploadProgress } from 'ngx-uploader-directive';
import { environment } from '@env/environment';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  /**
   * FileUploadComponent output events.
   * @param uploadOnDrop boolean Start upload when dropping file(s)
   * @param fileUploaded string Returns name of file when upload is complete
   */
  @Input() uploadOnDrop = false;
  @Output() fileUploadComplete = new EventEmitter<string>();

  public options: IUploadOptions = {
    requestConcurrency: 1,
    maxFilesToAddInSingleRequest: 10,
    maxFileUploads: 5,
    maxFileSize: 10e6,
    logs: false // Enable during development only
  };
  public filename: string;
  public files = new Array<ISelectedFile>();
  public uploadInput = new EventEmitter<IUploadInput>();
  public uploadCompleted = false;
  private dragOver: boolean;
  private uploadUrl = environment.FIlE_UPLOAD_IP + '/api/upload/hullLines';
  private formData = [];

  /**
   * Default Constructor
   */
  constructor(
    private alert: AlertService
  ) {
  }

  public get hasFiles() {
    return this.files && this.files.length > 0
  }

  /**
 * Upload output events.
 * @param output IUploadOutput Model on output.
 */
  onUploadOutput(output: IUploadOutput): void {
    // if (output.type != 'dragOver') {
    //   console.log(`Event: ${output.type}`);
    // }
    switch (output.type) {
      case 'dragOver':
        this.dragOver = true;
        break;
      case 'init':
        this.files = new Array<ISelectedFile>();
        break;
      case 'allAddedToQueue':
        if (this.uploadOnDrop) {
          this.startUpload();
        }
        break;
      case 'addedToQueue':
        this.uploadCompleted = false;
        this.files = this.files.concat(output.files);
        this.filename = this.files[0].name;
        break;
      case 'start':
        // uploading start
        this.alert.sendAlert({text: 'Uploading...', type: 'primary'})
        break;
      case 'uploading':
        this.files = this.updateFiles(this.files, output.files, output.progress, 'UPDATE');
        break;
      case 'error':
        console.error(output)
        this.alert.sendAlert({text: 'Upload failed! ' + output.response.statusText, type: 'danger'});
        break;
      case 'rejected':
        this.alert.sendAlert({text: 'File too large!', type: 'warning'});
        break;
      case 'removed':
        this.files = this.updateFiles(this.files, output.files, output.progress, 'REMOVE');
        break;
      case 'removedAll':
        this.files = new Array<ISelectedFile>();
        break;
      case 'dragOut':
      case 'drop':
        this.dragOver = false;
        break;
      case 'done':
        // The files are uploaded
        this.files = this.updateFiles(this.files, output.files, output.progress, 'UPDATE');
        this.alert.sendAlert({text: 'File uploaded!', type: 'success'});
        this.fileUploadComplete.emit(output.files[0].name)
        this.uploadCompleted = true;
        break;
    }
  }

  /**
 * Update files on output events
 * @param currentFiles Current Files Array
 * @param updatedFiles Updated Files Array
 * @param progress File progress
 * @param action Remove or Update
 */
  updateFiles(
    currentFiles: Array<ISelectedFile>,
    updatedFiles: Array<ISelectedFile>,
    progress: IUploadProgress,
    action: 'REMOVE' | 'UPDATE'
  ) {
    if (updatedFiles !== undefined) {
      if (action === 'UPDATE') {
        updatedFiles.forEach(updateFile => {
          currentFiles.forEach(
            (currentFile, currentFileIndex, currentFilesArray) => {
              if (currentFile.name === updateFile.name) {
                currentFilesArray[currentFileIndex] = updateFile;
                if (progress !== undefined) {
                  currentFilesArray[currentFileIndex].progress = progress;
                }
              }
            }
          );
        });
      } else if (action === 'REMOVE') {
        if (updatedFiles.length > 0) {
          currentFiles = currentFiles.filter((file) => file.requestId !== updatedFiles[0].requestId);
        } else {
          currentFiles = updatedFiles;
        }
      }
    }
    return currentFiles;
  }

  /**
   * Start Upload
   */
  startUpload(): void {
    if (this.files.length > 0) {
      this.formData.push({'fileHasHeader': 'false'});
      this.formData.push({'delimiter': ','});

      // ToDo: 
      const event: IUploadInput = {
        type: 'uploadAll',
        inputReferenceNumber: Math.random(),
        url: this.uploadUrl,
        method: 'POST',
        data: {
          foo: 'bar'
        },
        headers: { Authorization: localStorage.getItem('token')}
      };

      this.uploadInput.emit(event);
    } else {
      // console.error('No files selected');
      this.alert.sendAlert({
        text: 'No file selected!',
        type: 'warning'
      })
    }
  }

  /**
   * Cancel file uploads.
   * @param requestId RequestId.
   */
  cancelUpload(requestId: string): void {
    console.log('CANCEL_UPLOAD');
    console.log(requestId);
    this.uploadInput.emit({ type: 'cancel', inputReferenceNumber: Math.random(), requestId });
  }

  /**
   * Remoce files.
   * @param requestId Request id
   */
  removeFile(requestId: string): void {
    console.log('REMOVE_FILE');
    console.log(requestId);
    this.uploadInput.emit({ type: 'remove', inputReferenceNumber: Math.random(), requestId });
  }

  /**
   * Remoce all file uploads.
   */
  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll', inputReferenceNumber: Math.random() });
  }

  public printFileSize(file: ISelectedFile) {
    let sz = file.nativeFile.size;
    if (sz < 1e3) {
      return '1kb'
    } else if (sz < 1e6) {
      return Math.round(sz/1e3) + ' KB';
    } else if (sz < 1e9) {
      return Math.round(sz/1e6) +  'MB';
    }
    return 'N/a';
  }
}