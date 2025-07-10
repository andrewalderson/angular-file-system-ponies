import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { FileSystemFileHandle } from '../file-system-file-handle';
import { ReadonlyDirectoryAdapter, ReadonlyFileAdapter } from './adapters';
import { showDirectoryPicker } from './show-directory-picker';

class MockRenderer {
  createElement(type: string) {
    return document.createElement(type);
  }

  appendChild(parent: Element, newChild: Element) {
    parent.appendChild(newChild);
  }

  listen(element: EventTarget, event: string, callback: (event: Event) => boolean | void) {
    element.addEventListener(event, callback);

    return () => element.removeEventListener(event, callback);
  }
}

const files: File[] = [
  { name: 'one.txt', webkitRelativePath: 'root/one.txt' },
  { name: 'two.txt', webkitRelativePath: 'root/two.txt' },
  { name: 'one.txt', webkitRelativePath: 'root/first/one.txt' },
  { name: 'two.txt', webkitRelativePath: 'root/first/two.txt' },
  { name: 'three.txt', webkitRelativePath: 'root/first/three.txt' },
  { name: 'one.txt', webkitRelativePath: 'root/second/one.txt' },
  { name: 'two.txt', webkitRelativePath: 'root/second/two.txt' },
  { name: 'one.txt', webkitRelativePath: 'root/second/third/one.txt' },
] as File[];

// using document.querySelector here because it is the only way I can get the input element
const getInputElement: () => HTMLInputElement = () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  // need to set the input multiple attribute to true because the userEvent upload method
  // doesn't properly check for 'webkitdirectory' support and if it is not set, it will
  // act as a singlr selection input and only return one file
  // we don't do this in the ponyfill because we only want one directory selected at a time
  input.multiple = true;
  return input;
};

describe('showDirectoryPicker', () => {
  beforeAll(() => {
    // Not implemented in non-browser (jsdom) test environment
    HTMLInputElement.prototype.showPicker = vi.fn();
  });
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Renderer2, useClass: MockRenderer }] });
  });

  it('should create a properly configured input', async () => {
    // SANITY CHECK: this test is only here to ensure that the input is created correctly
    const user = userEvent.setup();
    const directoryHandlePromise = TestBed.runInInjectionContext(() => showDirectoryPicker());

    const input = getInputElement();
    await user.upload(input, files);

    await directoryHandlePromise;

    expect(input).not.toBeNull();
    expect(input?.type).toBe('file');
    expect(input?.webkitdirectory).toBe(true);
    expect(input?.ariaHidden).toBe('true');
    expect(input?.tabIndex).toBe(-1);
    expect(input?.style.display).toBe('none');
  });

  it('should return the selected directory as a FileSystemDirectoryHandle', async () => {
    const user = userEvent.setup();
    const directoryHandlePromise = TestBed.runInInjectionContext(() => showDirectoryPicker());

    const input = getInputElement();
    await user.upload(input, files);

    await expect(directoryHandlePromise).resolves.toBeInstanceOf(FileSystemDirectoryHandle);
  });

  it('should set the entries on the returned FileSystemDirectoryHandle', async () => {
    const expectedEntries = new Map();
    expectedEntries.set('one.txt', new FileSystemFileHandle(new ReadonlyFileAdapter(files[0])));
    expectedEntries.set('two.txt', new FileSystemFileHandle(new ReadonlyFileAdapter(files[1])));
    const first = new ReadonlyDirectoryAdapter('first');
    first._entries.set('one.txt', new ReadonlyFileAdapter(files[2]));
    first._entries.set('two.txt', new ReadonlyFileAdapter(files[3]));
    first._entries.set('three.txt', new ReadonlyFileAdapter(files[4]));
    expectedEntries.set('first', new FileSystemDirectoryHandle(first));
    const second = new ReadonlyDirectoryAdapter('second');
    second._entries.set('one.txt', new ReadonlyFileAdapter(files[5]));
    second._entries.set('two.txt', new ReadonlyFileAdapter(files[6]));
    const third = new ReadonlyDirectoryAdapter('third');
    third._entries.set('one.txt', new ReadonlyFileAdapter(files[7]));
    second._entries.set('third', third);
    expectedEntries.set('second', new FileSystemDirectoryHandle(second));

    const user = userEvent.setup();
    const directoryHandlePromise = TestBed.runInInjectionContext(() => showDirectoryPicker());

    const input = getInputElement();
    await user.upload(input, files);

    const handle = await directoryHandlePromise;

    // TODO: can use Array.fromAsync here once it is available
    const promises = [];
    for await (const entry of handle.entries()) {
      promises.push(Promise.resolve(entry));
    }
    await expect(Promise.all(promises)).resolves.toStrictEqual(Array.from(expectedEntries));
  });

  it('should throw an AbortError error if the user cancels the operation', async () => {
    const directoryHandlePromise = TestBed.runInInjectionContext(() => showDirectoryPicker());

    const input = getInputElement();
    fireEvent(input, new Event('cancel'));

    await expect(directoryHandlePromise).rejects.toThrowError(
      expect.objectContaining({
        name: 'AbortError',
      })
    );
  });
});
