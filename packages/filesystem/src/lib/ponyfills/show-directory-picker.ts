import { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { DirectoryPickerOptions } from '../types';
import { ReadonlyDirectoryAdapter, ReadonlyFileAdapter } from './adapters';

export async function showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle> {
  // TODO: use Promise.withResolvers when all browsers the Angular version supports implement it
  let resolve: (value: FileSystemDirectoryHandle | PromiseLike<FileSystemDirectoryHandle>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject: (reason?: any) => void;
  const promise = new Promise<FileSystemDirectoryHandle>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const input: HTMLInputElement = document.createElement('input');
  input.type = 'file';
  input.webkitdirectory = true;
  input.ariaHidden = 'true'; // Hide from screen readers
  input.tabIndex = -1; // Remove from tab order
  input.style.display = 'none';

  // See https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
  document.body.appendChild(input);

  const abortController = new AbortController();
  input.addEventListener(
    'change',
    () => {
      if (input.files) {
        const files = Array.from(input.files);
        const rootPath = files[0].webkitRelativePath.split('/', 1)[0];
        const root = new ReadonlyDirectoryAdapter(rootPath);
        for (const file of files) {
          const paths = file.webkitRelativePath.split('/');
          paths.shift();
          const fileName: string = paths.pop() as string;
          const dir = paths.reduce((dir, segment) => {
            if (!dir._entries.has(segment)) {
              dir._entries.set(segment, new ReadonlyDirectoryAdapter(segment));
            }
            return dir._entries.get(segment) as ReadonlyDirectoryAdapter;
          }, root);

          dir._entries.set(fileName, new ReadonlyFileAdapter(file));
        }

        resolve(new FileSystemDirectoryHandle(root));
      }
    },
    { signal: abortController.signal }
  );

  input.addEventListener(
    'cancel',
    () => {
      reject(
        new DOMException(
          "Failed to execute 'showDirectoryPicker' on 'Window': The user aborted a request.",
          'AbortError'
        )
      );
    },
    { signal: abortController.signal }
  );

  input.showPicker();

  return promise.finally(() => {
    abortController.abort();
    input.remove();
  });
}
