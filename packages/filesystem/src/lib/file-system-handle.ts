import { FileSystemHandleAdapter } from './interfaces';

const _adapter = Symbol('adapter');

export abstract class FileSystemHandle implements globalThis.FileSystemHandle {
  /** @internal */
  [_adapter]: FileSystemHandleAdapter;

  abstract readonly kind: FileSystemHandleKind;
  readonly name: string;

  constructor(adapter: FileSystemHandleAdapter) {
    this[_adapter] = adapter;
    this.name = adapter.name;
  }

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    if (this === other) return true;
    if (this.kind !== other.kind) return false;

    return this[_adapter].isSameEntry(other[_adapter]);
  }
}

Object.defineProperty(FileSystemHandle.prototype, Symbol.toStringTag, {
  value: 'FileSystemHandle',
  writable: false,
  enumerable: false,
  configurable: true,
});

export default FileSystemHandle;
