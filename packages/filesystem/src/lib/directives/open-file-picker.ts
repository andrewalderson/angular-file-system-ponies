import { Directive, input, output } from '@angular/core';
import '../show-open-file-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showOpenFilePicker'
import type { OpenFilePickerOptions } from '../types'; // TODO: remove when no longer need to ponyfill 'globalThis.showOpenFilePicker'

@Directive({
  selector: '[libOpenFilePicker]',
  exportAs: 'libOpenFilePicker',
  host: {
    '(click)': 'pickFiles($event)',
  },
})
export class OpenFilePicker {
  readonly options = input<OpenFilePickerOptions>(undefined, { alias: 'libOpenFilePickerOptions' });

  readonly files = output<FileSystemFileHandle[]>({ alias: 'libOpenFilePickerFiles' });

  protected async pickFiles(event: Event) {
    event.preventDefault();

    try {
      // @ts-expect-error remove when no longer need to ponyfill 'globalThis.showOpenFilePicker'
      const fileHandles = await showOpenFilePicker(this.options());

      if (fileHandles) {
        this.files.emit(fileHandles);
      }
    } catch {
      // TODO: what do we do with errors?
    }
  }
}

export default OpenFilePicker;
