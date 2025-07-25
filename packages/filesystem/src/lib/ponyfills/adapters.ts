import { FileSystemDirectoryHandleAdapter, FileSystemFileHandleAdapter } from '../interfaces';

class DownloadSink implements UnderlyingSink<FileSystemWriteChunkType> {
  private chunks: BlobPart[] = [];

  constructor(private name = 'download') {}

  async write(chunk: FileSystemWriteChunkType) {
    const part: BlobPart = (
      typeof chunk === 'object' && chunk !== null && 'data' in chunk ? chunk.data : chunk
    ) as BlobPart;
    if (part) {
      this.chunks.push(part);
    }
  }

  async close() {
    const link = document.createElement('a');
    link.download = this.name;
    const blob = new Blob(this.chunks, { type: 'application/octet-stream; charset=utf-8' });
    this.chunks = [];
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  }
}

/**
 * Used by 'showSaveFilePicker' to download the file
 */
export class WritableFileAdapter implements FileSystemFileHandleAdapter {
  readonly kind = 'file';
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async createWritable(options: FileSystemCreateWritableOptions): Promise<UnderlyingSink<FileSystemWriteChunkType>> {
    return new DownloadSink(this.name);
  }

  getFile(): Promise<File> {
    // There is no file to get
    throw new DOMException('The requested method is not supported.', 'NotSupportedError');
  }

  async isSameEntry(other: this): Promise<boolean> {
    // Since there is no backing file there is nothing to compare
    throw new DOMException('The requested method is not supported.', 'NotSupportedError');
  }
}

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

/**
 * Used by the 'showDirectoryPicker' ponyfills
 */
export class ReadonlyDirectoryAdapter implements FileSystemDirectoryHandleAdapter {
  readonly kind = 'directory';

  /* @internal */
  readonly _entries: Map<string, ReadonlyDirectoryAdapter | ReadonlyFileAdapter> = new Map();

  constructor(readonly name: string) {}

  async *entries(): AsyncGenerator<
    [string, FileSystemFileHandleAdapter | FileSystemDirectoryHandleAdapter],
    void,
    undefined
  > {
    yield* this._entries.entries();
  }

  async isSameEntry(other: this): Promise<boolean> {
    // In the scope of how this will be used in an app, this comparison should be fine (ó﹏ò｡)
    return this === other;
  }

  async getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<ReadonlyDirectoryAdapter> {
    const exists = this._entries.has(name);
    if (!exists && options?.create) {
      this._entries.set(name, new ReadonlyDirectoryAdapter(name));
    }

    const entry = this._entries.get(name);
    if (!entry) {
      throw new DOMException(
        'A requested file or directory could not be found at the time an operation was processed.',
        'NotFoundError'
      );
    }
    if (!(entry instanceof ReadonlyDirectoryAdapter)) {
      throw new DOMException('The path supplied exists, but was not an entry of requested type.', 'TypeMismatchError');
    }

    return entry;
  }

  async getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<ReadonlyFileAdapter> {
    const exists = this._entries.has(name);
    if (!exists && options?.create) {
      this._entries.set(name, new ReadonlyFileAdapter(new File([], name)));
    }

    const entry = this._entries.get(name);
    if (!entry) {
      throw new DOMException(
        'A requested file or directory could not be found at the time an operation was processed.',
        'NotFoundError'
      );
    }
    if (!(entry instanceof ReadonlyFileAdapter)) {
      throw new DOMException('The path supplied exists, but was not an entry of requested type.', 'TypeMismatchError');
    }

    return entry;
  }
}
