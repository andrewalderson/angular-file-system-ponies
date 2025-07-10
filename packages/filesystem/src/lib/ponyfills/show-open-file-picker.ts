import { DOCUMENT, inject, Renderer2 } from '@angular/core';
import { FileSystemFileHandle } from '../file-system-file-handle';
import type { FilePickerAcceptType, OpenFilePickerOptions } from '../types';
import { ReadonlyFileAdapter } from './adapters';

export async function showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]> {
  // IMPORTANT: this code needs to be run in an injection context
  const renderer = inject(Renderer2);
  const document = inject(DOCUMENT);

  let resolve: (value: FileSystemFileHandle[] | PromiseLike<FileSystemFileHandle[]>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject: (reason?: any) => void;
  // TODO: use Promise.withResolvers when supported
  const promise = new Promise<FileSystemFileHandle[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const input: HTMLInputElement = renderer.createElement('input');
  input.type = 'file';
  input.multiple = !!options?.multiple;

  if (options?.types) {
    // Currently we are not validating the accept types like the global.showOpenFilePicker does
    // because it would slow things down
    // we are relying on TypeScript to do some basic validation and putting
    // validation into the developers hands
    // TODO: look at making validation compliant with showOpenFilepicker options spec
    const accept = new Set(
      options.types.flatMap((t: Pick<FilePickerAcceptType, 'accept'>) => [
        ...Object.keys(t.accept),
        ...Object.values(t.accept).flat(),
      ])
    );
    input.accept = Array.from(accept).join(',');
  }

  // See https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
  Object.assign(input.style, {
    position: 'fixed',
    top: '-100000px',
    left: '-100000px',
  });
  renderer.appendChild(document.body, input);

  const unlistenFns = [
    renderer.listen(input, 'change', () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fileHandles = Array.from(input.files!).map(
        (file) => new FileSystemFileHandle(new ReadonlyFileAdapter(file))
      );
      resolve(fileHandles);
    }),
    renderer.listen(input, 'cancel', () => {
      // This exception matches globalThis.showOpenFilePicker implementation.
      // The message is the one shown in Edge
      // There is no standard for it so it may be different in different browsers/OS
      reject(
        new DOMException(
          "Failed to execute 'showOpenFilePicker' on 'Window': The user aborted a request.",
          'AbortError'
        )
      );
    }),
  ];

  input.showPicker();

  return promise.finally(() => {
    unlistenFns.forEach((unlisten) => unlisten());
    input.remove();
  });
}
