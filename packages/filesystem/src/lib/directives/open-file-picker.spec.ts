import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import { FileSystemFileHandle } from '../file-system-file-handle';
import OpenFilePicker from './open-file-picker';

let showOpenFilePickerMock;

const FileHandle = vi.fn();
const mockHandles = [new FileHandle()];

describe('OpenFilePicker', () => {
  beforeAll(async () => {
    const { showOpenFilePicker } = vi.hoisted(() => ({ showOpenFilePicker: vi.fn() }));
    showOpenFilePickerMock = showOpenFilePicker;
    vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);

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
