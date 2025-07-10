import FileSystemFileHandle from './file-system-file-handle';
import FileSystemHandle from './file-system-handle';
import { FileSystemDirectoryHandleAdapter } from './interfaces';

const _adapter = Symbol('adapter');

export class FileSystemDirectoryHandle extends FileSystemHandle implements globalThis.FileSystemDirectoryHandle {
  /** @internal */
  [_adapter]: FileSystemDirectoryHandleAdapter;

  override readonly kind = 'directory';

  constructor(adapter: FileSystemDirectoryHandleAdapter) {
    super(adapter);
    this[_adapter] = adapter;
  }

  // prettier-ignore
  async getDirectoryHandle(name: string, options: FileSystemGetDirectoryOptions = {}): Promise<FileSystemDirectoryHandle> {
    this.validateName(name);

    return new FileSystemDirectoryHandle(await this[_adapter].getDirectoryHandle(name, options));
  }

  async getFileHandle(name: string, options: FileSystemGetFileOptions = {}): Promise<FileSystemFileHandle> {
    this.validateName(name);

    return new FileSystemFileHandle(await this[_adapter].getFileHandle(name, options));
  }

  async removeEntry(name: string, options: FileSystemRemoveOptions = {}): Promise<void> {
    // We can't get readwrite access to the file system so there is nothing we can remove
    throw new DOMException('The requested method is not supported.', 'NotSupportedError');
  }

  async resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null> {
    if (await possibleDescendant.isSameEntry(this)) {
      return [];
    }

    const openSet: { handle: FileSystemDirectoryHandle; path: string[] }[] = [{ handle: this, path: [] }];

    while (openSet.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { handle: current, path } = openSet.pop()!;

      for await (const entry of current.values()) {
        if (await entry.isSameEntry(possibleDescendant)) {
          return [...path, entry.name];
        }
        if (entry.kind === 'directory') {
          openSet.push({ handle: entry, path: [...path, entry.name] });
        }
      }
    }

    return null;
  }

  async *entries() {
    for await (const [_, entry] of this[_adapter].entries())
      yield [
        entry.name,
        entry.kind === 'file' ? new FileSystemFileHandle(entry) : new FileSystemDirectoryHandle(entry),
      ] as [string, FileSystemFileHandle | FileSystemDirectoryHandle];
  }

  async *keys() {
    for await (const [name] of this.entries()) yield name;
  }

  async *values() {
    for await (const [_, entry] of this.entries()) yield entry;
  }

  [Symbol.asyncIterator]() {
    return this.entries();
  }

  private validateName(name: string) {
    if (name === '') throw new TypeError(`Name can't be an empty string.`);
    if (name === '.' || name === '..' || name.includes('/')) throw new TypeError(`Name contains invalid characters.`);
  }
}

Object.defineProperty(FileSystemDirectoryHandle.prototype, Symbol.toStringTag, {
  value: 'FileSystemDirectoryHandle',
  writable: false,
  enumerable: false,
  configurable: true,
});

Object.defineProperties(FileSystemDirectoryHandle.prototype, {
  getDirectoryHandle: { enumerable: true },
  entries: { enumerable: true },
  getFileHandle: { enumerable: true },
  removeEntry: { enumerable: true },
});

export default FileSystemDirectoryHandle;
