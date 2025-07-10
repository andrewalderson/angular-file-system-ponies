export interface FileSystemHandleAdapter {
  readonly kind: FileSystemHandleKind;
  readonly name: string;

  isSameEntry(other: this): Promise<boolean>;
}

export interface FileSystemFileHandleAdapter<W = FileSystemWriteChunkType> extends FileSystemHandleAdapter {
  readonly kind: Extract<FileSystemHandleKind, 'file'>;

  createWritable(options: FileSystemCreateWritableOptions): Promise<UnderlyingSink<W>>;
  getFile(): Promise<File>;
}

export interface FileSystemDirectoryHandleAdapter extends FileSystemHandleAdapter {
  readonly kind: Extract<FileSystemHandleKind, 'directory'>;

  entries(): AsyncGenerator<[string, FileSystemFileHandleAdapter | FileSystemDirectoryHandleAdapter], void, undefined>;
  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandleAdapter>;
  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandleAdapter>;
}
