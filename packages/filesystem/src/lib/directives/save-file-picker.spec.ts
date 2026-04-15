import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import { SaveFilePicker } from './save-file-picker';

let showSaveFilePickerMock;

const FileHandle = vi.fn();
const mockHandle = new FileHandle();

describe('SaveFilePicker', () => {
  beforeAll(async () => {
    const { showSaveFilePicker } = vi.hoisted(() => ({ showSaveFilePicker: vi.fn() }));
    showSaveFilePickerMock = showSaveFilePicker;
    vi.stubGlobal('showSaveFilePicker', showSaveFilePickerMock);
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
