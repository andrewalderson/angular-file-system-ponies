import FileSystemHandle from './file-system-handle';
import FileSystemWritableFileStream from './file-system-writable-file-stream';
import type { FileSystemFileHandleAdapter } from './interfaces';

const _adapter = Symbol('adapter');

export class FileSystemFileHandle extends FileSystemHandle implements globalThis.FileSystemFileHandle {
  /** @internal */
  [_adapter]: FileSystemFileHandleAdapter;

  override readonly kind = 'file';

  constructor(adapter: FileSystemFileHandleAdapter) {
    super(adapter);
    this[_adapter] = adapter;
  }

  async createWritable(options: FileSystemCreateWritableOptions = {}): Promise<FileSystemWritableFileStream> {
    const writable = await this[_adapter].createWritable(options); // This will throw an error if the adapter is not writable
    const { FileSystemWritableFileStream } = await import('./file-system-writable-file-stream');
    return new FileSystemWritableFileStream(writable);
  }

  async getFile(): Promise<File> {
    return this[_adapter].getFile();
  }
}

Object.defineProperty(FileSystemFileHandle.prototype, Symbol.toStringTag, {
  value: 'FileSystemFileHandle',
  writable: false,
  enumerable: false,
  configurable: true,
});

Object.defineProperties(FileSystemFileHandle.prototype, {
  createWritable: { enumerable: true },
  getFile: { enumerable: true },
});

export default FileSystemFileHandle;
