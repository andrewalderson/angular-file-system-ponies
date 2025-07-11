import { Component, output } from '@angular/core';
import { render } from '@testing-library/angular';
import type { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { DirectoryPicker } from './directory-picker';

let showDirectoryPickerMock;

const DirectoryHandle = vi.fn();
const mockHandle = new DirectoryHandle();

describe('DirectoryPicker', () => {
  beforeAll(async () => {
    // We can't just stub globalThis.showDirectoryPicker here because it happens to late
    // We need to mock the ponyfill module because vi.mock hoists the mock to the top
    // of the executuon context so it gets mocked before it is imported into the directive
    // TODO: once the ponyfill is removed, replace the mock below with vi.stubGlobal('showDirectoryPicker', showDirectoryPickerMock);
    // we can also initialize 'showDirectoryPickerMock' where it is declared when this is done.
    const { showDirectoryPicker } = vi.hoisted(() => ({ showDirectoryPicker: vi.fn() }));
    vi.mock('../show-directory-picker', () => ({ showDirectoryPicker }));
    showDirectoryPickerMock = showDirectoryPicker;

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
      // TODO: remove this null assertion when we can stub 'globalThis.showDirectoryPicker'. See the beforeAll block.
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
