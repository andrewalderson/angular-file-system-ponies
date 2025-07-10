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
