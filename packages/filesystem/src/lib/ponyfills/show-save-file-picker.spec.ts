import { FileSystemFileHandle } from '../file-system-file-handle';
import { showSaveFilePicker } from './show-save-file-picker';

describe('showSaveFilePicker', () => {
  it('should return a FileSystemFileHandle', async () => {
    const handle = await showSaveFilePicker();

    expect(handle).toBeInstanceOf(FileSystemFileHandle);
  });
  it('should not set the returned handles name if it is not provided', async () => {
    const handle = await showSaveFilePicker();

    expect(handle.name).toBe('');
  });

  it('should not set the returned handles name if it is provided', async () => {
    const handle = await showSaveFilePicker({ suggestedName: 'save' });

    expect(handle.name).toBe('save');
  });
});
