import { Directive, input, output } from '@angular/core';
import type { FileSystemDirectoryHandle } from '../file-system-directory-handle'; // TODO: remove when no longer need to ponyfill 'globalThis.showDirectoryPicker'
import '../show-directory-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showDirectoryPicker'
import type { DirectoryPickerOptions } from '../types'; // TODO: remove when no longer need to ponyfill 'globalThis.showDirectoryPicker'

@Directive({
  selector: '[libDirectoryPicker]',
  exportAs: 'libDirectoryPicker',
  host: {
    '(click)': 'pickDirectory($event)',
  },
})
export class DirectoryPicker {
  readonly options = input<DirectoryPickerOptions>(undefined, { alias: 'libDirectoryPickerOptions' });

  readonly directory = output<FileSystemDirectoryHandle>({ alias: 'libDirectoryPickerDirectory' });

  protected async pickDirectory(event: Event) {
    event.preventDefault();

    try {
      // @ts-expect-error remove when no longer need to ponyfill 'globalThis.showDirectoryPicker'
      const handle = await showDirectoryPicker(this.options());

      if (handle) {
        this.directory.emit(handle);
      }
    } catch {
      // TODO: what do we do with errors?
    }
  }
}
