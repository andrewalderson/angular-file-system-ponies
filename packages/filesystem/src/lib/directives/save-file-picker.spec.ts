import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import { FileSystemFileHandle } from '../file-system-file-handle';
import { SaveFilePicker } from './save-file-picker';

let showSaveFilePickerMock;

const FileHandle = vi.fn();
const mockHandle = new FileHandle();

describe('SaveFilePicker', () => {
  beforeAll(async () => {
    // We can't just stub globalThis.showSaveFilePicker here because it happens to late
    // We need to mock the ponyfill module because vi.mock hoists the mock to the top
    // of the executuon context so it gets mocked before it is imported into the directive
    // TODO: once the ponyfill is removed, replace the mock below with vi.stubGlobal('showSaveFilePicker', showSaveFilePickerMock);
    // we can also initialize 'showSaveFilePickerMock' where it is declared when this is done.
    const { showSaveFilePicker } = vi.hoisted(() => ({ showSaveFilePicker: vi.fn() }));
    vi.mock('../show-save-file-picker', () => ({ showSaveFilePicker }));
    showSaveFilePickerMock = showSaveFilePicker;

    showSaveFilePickerMock.mockResolvedValueOnce(mockHandle);
  });

  it('should return the selected file handle', async () => {
    const fileSpy = vi.fn();
    const { findByTestId } = await render(SaveFilePickerHost, {
      on: {
        file: fileSpy,
      },
    });

    const button = await findByTestId('save-picker-button');
    button.click();

    await vi.waitFor(async () => {
      // TODO: remove this null assertion when we can stub 'globalThis.showSaveFilePicker'. See the beforeAll block.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(showSaveFilePickerMock!).toHaveResolved();
    });

    expect(fileSpy).toHaveBeenCalledWith(mockHandle);
  });
});

@Component({
  selector: 'lib-save-file-picker-host',
  imports: [SaveFilePicker],
  template: `<button
    data-testid="save-picker-button"
    type="button"
    libSaveFilePicker
    (libSaveFilePickerFile)="file.emit($event)"
  >
    Save File
  </button>`,
})
class SaveFilePickerHost {
  file = output<FileSystemFileHandle>();
}
