import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import type { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { DirectoryPicker } from './directory-picker';

let showDirectoryPickerMock;

const DirectoryHandle = vi.fn();
const mockHandle = new DirectoryHandle();

describe('DirectoryPicker', () => {
  beforeAll(async () => {
    const { showDirectoryPicker } = vi.hoisted(() => ({ showDirectoryPicker: vi.fn() }));
    showDirectoryPickerMock = showDirectoryPicker;
    vi.stubGlobal('showDirectoryPicker', showDirectoryPickerMock);
    showDirectoryPickerMock.mockResolvedValueOnce(mockHandle);
  });

  it('should return the selected directory handle', async () => {
    const directorySpy = vi.fn();
    const { findByTestId } = await render(DirectoryPickerHost, {
      on: {
        directory: directorySpy,
      },
    });

    const button = await findByTestId('directory-picker-button');
    button.click();

    await vi.waitFor(async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(showDirectoryPickerMock!).toHaveResolved();
    });

    expect(directorySpy).toHaveBeenCalledWith(mockHandle);
  });
});

@Component({
  selector: 'lib-directory-picker-host',
  imports: [DirectoryPicker],
  template: `<button
    data-testid="directory-picker-button"
    type="button"
    libDirectoryPicker
    (libDirectoryPickerDirectory)="directory.emit($event)"
  >
    Save Directory
  </button>`,
})
class DirectoryPickerHost {
  directory = output<FileSystemDirectoryHandle>();
}
