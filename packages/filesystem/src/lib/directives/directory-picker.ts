import { Directive, inject, Injector, input, output, runInInjectionContext } from '@angular/core';
import { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { showDirectoryPicker } from '../show-directory-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showDirectoryPicker'
import type { DirectoryPickerOptions } from '../types';

@Directive({
  selector: '[libDirectoryPicker]',
  exportAs: 'libDirectoryPicker',
  host: {
    '(click)': 'pickDirectory($event)',
  },
})
export class DirectoryPicker {
  private readonly _injector = inject(Injector);

  readonly options = input<DirectoryPickerOptions>(undefined, { alias: 'libDirectoryPickerOptions' });

  readonly directory = output<FileSystemDirectoryHandle>({ alias: 'libDirectoryPickerDirectory' });

  protected async pickDirectory(event: Event) {
    event.preventDefault();

    // TODO remove the 'runInInjectionContext' wrapper when we remove the ponyfill import
    const handle = await runInInjectionContext<Promise<FileSystemDirectoryHandle>>(this._injector, () =>
      showDirectoryPicker(this.options())
    ).catch(console.error); // TODO: what do we do with errors?

    if (handle) {
      this.directory.emit(handle);
    }
  }
}
