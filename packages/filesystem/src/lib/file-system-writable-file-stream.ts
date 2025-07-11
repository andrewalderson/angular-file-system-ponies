export class FileSystemWritableFileStream extends globalThis.WritableStream {
  constructor(underlyingSink?: UnderlyingSink, strategy?: QueuingStrategy) {
    super(underlyingSink, strategy);

    // Stupid Safari hack to extend native classes
    // https://bugs.webkit.org/show_bug.cgi?id=226201
    Object.setPrototypeOf(this, FileSystemWritableFileStream.prototype);
  }

  seek(position: number): Promise<void> {
    return this.write({ type: 'seek', position });
  }

  truncate(size: number): Promise<void> {
    return this.write({ type: 'truncate', size });
  }

  write(data: FileSystemWriteChunkType): Promise<void> {
    const writer = this.getWriter();
    const p = writer.write(data);
    writer.releaseLock();
    return p;
  }
}

Object.defineProperty(FileSystemWritableFileStream.prototype, Symbol.toStringTag, {
  value: 'FileSystemWritableFileStream',
  writable: false,
  enumerable: false,
  configurable: true,
});

Object.defineProperties(FileSystemWritableFileStream.prototype, {
  close: { enumerable: true },
  seek: { enumerable: true },
  truncate: { enumerable: true },
  write: { enumerable: true },
});

export default FileSystemWritableFileStream;
