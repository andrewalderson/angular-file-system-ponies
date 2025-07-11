// @ts-expect-error Property 'getAsFileSystemHandle' does not exist on type 'DataTransferItem'.
if (globalThis.DataTransferItem && !DataTransferItem.prototype.getAsFileSystemHandle) {
  // @ts-expect-error Property 'getAsFileSystemHandle' does not exist on type 'DataTransferItem'.
  DataTransferItem.prototype.getAsFileSystemHandle = async function () {
    // according to https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
    // 'webkitGetAsEntry' may be renamed to 'getAsEntry' in the future so we will check for it
    // @ts-expect-error Object is of type 'unknown'.
    const entry = 'getAsEntry' in this ? this.getAsEntry() : this.webkitGetAsEntry();
    if (!entry) {
      return;
    }
    const [
      { ReadonlyFileEntryAdapter, ReadonlyDirectoryEntryAdapter },
      { FileSystemFileHandle },
      { FileSystemDirectoryHandle },
    ] = await Promise.all([
      import('./adapters'),
      import('../file-system-file-handle'),
      import('../file-system-directory-handle'),
    ]);

    return entry.isFile
      ? new FileSystemFileHandle(new ReadonlyFileEntryAdapter(entry as FileSystemFileEntry))
      : new FileSystemDirectoryHandle(new ReadonlyDirectoryEntryAdapter(entry as FileSystemDirectoryEntry));
  };
}

export default {};
