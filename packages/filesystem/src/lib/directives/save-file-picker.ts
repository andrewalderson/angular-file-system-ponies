import { Directive, input, output } from '@angular/core';
import { showSaveFilePicker } from '../show-save-file-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showSaveFilePicker'
import type { SaveFilePickerOptions } from '../types'; // TODO: remove when no longer need to ponyfill 'globalThis.showSaveFilePicker'

@Directive({
  selector: '[libSaveFilePicker]',
  exportAs: 'libSaveFilePicker',
  host: {
    '(click)': 'saveFile($event)',
  },
})
export class SaveFilePicker {
  readonly options = input<SaveFilePickerOptions>(undefined, { alias: 'libSaveFilePickerOptions' });

  readonly file = output<FileSystemFileHandle>({ alias: 'libSaveFilePickerFile' });

  protected async saveFile(event: Event) {
    event.preventDefault();

    try {
      const fileHandle = await showSaveFilePicker(this.options());

      if (fileHandle) {
        this.file.emit(fileHandle);
      }
    } catch {
      // TODO: what do we do with errors?
    }
  }
}
