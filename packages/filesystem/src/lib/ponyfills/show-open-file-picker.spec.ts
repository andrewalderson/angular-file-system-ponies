import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { OpenFilePickerOptions } from '../types';
import { showOpenFilePicker } from './show-open-file-picker';

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

describe('showOpenFilePicker', () => {
  beforeAll(() => {
    // Not implemented in non-browser (jsdom) test environment
    HTMLInputElement.prototype.showPicker = vi.fn();
  });
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Renderer2, useClass: MockRenderer }] });
  });
  it('should return the selected files', async () => {
    const user = userEvent.setup();
    const expectedFiles = [new File([], 'test')];
    const fileHandlePromises = TestBed.runInInjectionContext(() => showOpenFilePicker());
    const input: HTMLInputElement | null = document.querySelector('input[type="file"]');
    if (input) {
      await user.upload(input, expectedFiles);
    }

    const fileHandles = await fileHandlePromises;
    await expect(Promise.all(fileHandles.map((handle) => handle.getFile()))).resolves.toEqual(expectedFiles);
  });

  it('should throw an AbortError error if the user cancels the operation', async () => {
    const fileHandlePromises = TestBed.runInInjectionContext(() => showOpenFilePicker());
    const input: HTMLInputElement | null = document.querySelector('input[type="file"]');
    if (input) {
      fireEvent(input, new Event('cancel'));
    }

    await expect(fileHandlePromises).rejects.toThrowError(
      expect.objectContaining({
        name: 'AbortError',
      })
    );
  });

  describe('options', () => {
    it('should set the inputs accept types', () => {
      // TODO: look into why we need 'NoInfer' here
      const options: NoInfer<OpenFilePickerOptions> = {
        types: [
          {
            description: 'Text Files',
            accept: {
              'text/plain': ['.txt', '.text'],
              'text/html': ['.html', '.htm'],
            },
          },
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
            },
          },
        ],
      };
      TestBed.runInInjectionContext(() => showOpenFilePicker(options));
      const input: HTMLInputElement | null = document.querySelector('input[type="file"]');

      expect(input?.accept).toBe('text/plain,text/html,.txt,.text,.html,.htm,image/*,.png,.gif,.jpeg,.jpg');
    });
  });
});
