import { Component, output } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { FileSystemFileHandle } from '../file-system-file-handle';
import { Dropzone } from './dropzone';

describe('Dropzone', () => {
  it('should emit the dropped files', async () => {
    const filesSpy = vi.fn();
    const { getByTestId } = await render(DropzoneHost, {
      on: {
        files: filesSpy,
      },
    });

    const file1 = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const file2 = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    const items = [
      {
        getAsFileSystemHandle: vi.fn().mockResolvedValue(file1),
      },
      {
        getAsFileSystemHandle: vi.fn().mockResolvedValue(file2),
      },
    ];

    fireEvent.drop(getByTestId('dropzone'), {
      dataTransfer: {
        items,
      },
    });

    expect(filesSpy).toHaveBeenCalledWith([file1, file2]);
  });

  it('should emit when the zone is entered', async () => {
    const enterSpy = vi.fn();
    const { getByTestId } = await render(DropzoneHost, {
      on: {
        enter: enterSpy,
      },
    });

    fireEvent.dragEnter(getByTestId('dropzone'));

    expect(enterSpy).toHaveBeenCalled();
  });

  it('should emit when the zone is exited', async () => {
    const leaveSpy = vi.fn();
    const { getByTestId } = await render(DropzoneHost, {
      on: {
        leave: leaveSpy,
      },
    });

    fireEvent.dragLeave(getByTestId('dropzone'));

    expect(leaveSpy).toHaveBeenCalled();
  });
});

@Component({
  selector: 'lib-dropzone-host',
  imports: [Dropzone],
  template: `<div
    data-testid="dropzone"
    libDropzone
    (libDropzoneFiles)="files.emit($event)"
    (libDropzoneEnter)="enter.emit()"
    (libDropzoneLeave)="leave.emit()"
  ></div>`,
})
class DropzoneHost {
  enter = output<void>();

  leave = output<void>();

  files = output<FileSystemFileHandle[]>();
}
