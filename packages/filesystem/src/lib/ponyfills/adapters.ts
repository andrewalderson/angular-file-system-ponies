import { FileSystemFileHandleAdapter } from '../interfaces';

/**
 * Used by the 'showOpenFilePicker' and 'showDirectoryPicker' ponyfills
 */
export class ReadonlyFileAdapter implements FileSystemFileHandleAdapter {
  readonly kind = 'file';
  readonly name: string;

  constructor(private file: File) {
    this.name = file.name;
  }

  async isSameEntry(other: this): Promise<boolean> {
    // In the scope of how this will be used in an app, this comparison should be fine (ó﹏ò｡)
    return this.file.webkitRelativePath === other.file.webkitRelativePath;
  }

  async createWritable(options: FileSystemCreateWritableOptions): Promise<UnderlyingSink<FileSystemWriteChunkType>> {
    // We can't get readwrite access to the file system so can't write to the file
    // When using the ponyfills you should just read the bytes from the file and save them seperately
    // and if you need to save them back, use the 'showSaveFilepicker' ponyfill to save the file by downloading it
    throw new DOMException(
      'The request is not allowed by the user agent or the platform in the current context.',
      'NotAllowedError'
    );
  }

  async getFile(): Promise<File> {
    return this.file;
  }
}
