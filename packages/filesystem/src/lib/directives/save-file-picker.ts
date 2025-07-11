import { Directive, inject, Injector, input, output, runInInjectionContext } from '@angular/core';
import { FileSystemFileHandle } from '../file-system-file-handle';
import { showSaveFilePicker } from '../show-save-file-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showSaveFilePicker'
import type { SaveFilePickerOptions } from '../types';

@Directive({
  selector: '[libSaveFilePicker]',
  exportAs: 'libSaveFilePicker',
  host: {
    '(click)': 'saveFile($event)',
  },
})
export class SaveFilePicker {
  private readonly _injector = inject(Injector);

  readonly options = input<SaveFilePickerOptions>(undefined, { alias: 'libSaveFilePickerOptions' });

  readonly file = output<FileSystemFileHandle>({ alias: 'libSaveFilePickerFile' });

  protected async saveFile(event: Event) {
    event.preventDefault();

    // TODO remove the 'runInInjectionContext' wrapper when we remove the ponyfill import
    const fileHandle = await runInInjectionContext<Promise<FileSystemFileHandle>>(this._injector, () =>
      showSaveFilePicker(this.options())
    ).catch(console.error); // TODO: what do we do with errors?

    if (fileHandle) {
      this.file.emit(fileHandle);
    }
  }
}
