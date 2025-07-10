import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import { FileSystemFileHandle } from '../file-system-file-handle';
import OpenFilePicker from './open-file-picker';

let showOpenFilePickerMock;

const FileHandle = vi.fn();
const mockHandles = [new FileHandle()];

describe('OpenFilePicker', () => {
  beforeAll(async () => {
    // We can't just stub globalThis.showOpenFilePicker here because it happens to late
    // We need to mock the ponyfill module because vi.mock hoists the mock to the top
    // of the executuon context so it gets mocked before it is imported into the directive
    // TODO: once the ponyfill is removed, replace the mock below with vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);
    // we can also initialize 'showOpenFilePickerMock' where it is declared when this is done.
    const { showOpenFilePicker } = vi.hoisted(() => ({ showOpenFilePicker: vi.fn() }));
    vi.mock('../show-open-file-picker', () => ({ showOpenFilePicker }));
    showOpenFilePickerMock = showOpenFilePicker;

    showOpenFilePickerMock.mockResolvedValueOnce(mockHandles);
  });

  it('should return selected file handles', async ({ expect }) => {
    const filesSpy = vi.fn();
    const { findByTestId } = await render(OpenFilePickerHost, {
      on: {
        files: filesSpy,
      },
    });

    const button = await findByTestId('file-picker-button');
    button.click();

    await vi.waitFor(async () => {
      // TODO: remove this null assertion when we can stub 'globalThis.showOpenFilePicker'. See the beforeAll block.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(showOpenFilePickerMock!).toHaveResolved();
    });

    expect(filesSpy).toHaveBeenCalledWith(mockHandles);
  });
});

@Component({
  selector: 'lib-open-file-picker-host',
  imports: [OpenFilePicker],
  template: `<button
    data-testid="file-picker-button"
    type="button"
    libOpenFilePicker
    (libOpenFilePickerFiles)="files.emit($event)"
  >
    Select File
  </button>`,
})
class OpenFilePickerHost {
  files = output<FileSystemFileHandle[]>();
}
