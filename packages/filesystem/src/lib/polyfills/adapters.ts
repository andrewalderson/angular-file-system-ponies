import { FileSystemDirectoryHandleAdapter, FileSystemFileHandleAdapter } from '../interfaces';

/**
 * Used for drag and drop file operations
 */
export class ReadonlyFileEntryAdapter implements FileSystemFileHandleAdapter {
  public readonly kind = 'file';
  readonly name: string;

  constructor(private entry: FileSystemFileEntry) {
    this.name = entry.name;
  }

  async isSameEntry(other: this): Promise<boolean> {
    return this.entry.fullPath === other.entry.fullPath;
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
    return new Promise(this.entry.file.bind(this.entry));
  }
}

/**
 * Used for drag and drop file operations
 */
export class ReadonlyDirectoryEntryAdapter implements FileSystemDirectoryHandleAdapter {
  readonly kind = 'directory';
  readonly name: string;

  constructor(private dir: FileSystemDirectoryEntry) {
    this.name = dir.name;
  }

  async *entries(): AsyncGenerator<
    [string, FileSystemFileHandleAdapter | FileSystemDirectoryHandleAdapter],
    void,
    undefined
  > {
    const reader = this.dir.createReader();
    const entries = await new Promise(reader.readEntries.bind(reader));
    for (const entry of entries) {
      yield [
        entry.name,
        entry.isFile
          ? new ReadonlyFileEntryAdapter(entry as FileSystemFileEntry)
          : new ReadonlyDirectoryEntryAdapter(entry as FileSystemDirectoryEntry),
      ] as [string, FileSystemFileHandleAdapter | FileSystemDirectoryHandleAdapter];
    }
  }

  async isSameEntry(other: this): Promise<boolean> {
    return this.dir.fullPath === other.dir.fullPath;
  }

  async getDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandleAdapter> {
    return new Promise<ReadonlyDirectoryEntryAdapter>((resolve, reject) => {
      this.dir.getDirectory(
        name,
        options,
        (dir) => {
          resolve(new ReadonlyDirectoryEntryAdapter(dir as FileSystemDirectoryEntry));
        },
        reject
      );
    });
  }

  async getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandleAdapter> {
    return new Promise<ReadonlyFileEntryAdapter>((resolve, reject) =>
      this.dir.getFile(
        name,
        options,
        (file) => resolve(new ReadonlyFileEntryAdapter(file as FileSystemFileEntry)),
        reject
      )
    );
  }
}
