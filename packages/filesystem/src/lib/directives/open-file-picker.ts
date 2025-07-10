import { Directive, inject, Injector, input, output, runInInjectionContext } from '@angular/core';
import { showOpenFilePicker } from '../show-open-file-picker'; // TODO: remove when no longer need to ponyfill 'globalThis.showOpenFilePicker'
import type { OpenFilePickerOptions } from '../types';

@Directive({
  selector: '[libOpenFilePicker]',
  exportAs: 'libOpenFilePicker',
  host: {
    '(click)': 'pickFiles($event)',
  },
})
export class OpenFilePicker {
  private readonly _injector = inject(Injector);

  readonly options = input<OpenFilePickerOptions>(undefined, { alias: 'libOpenFilePickerOptions' });

  readonly files = output<FileSystemFileHandle[]>({ alias: 'libOpenFilePickerFiles' });

  protected async pickFiles(event: Event) {
    event.preventDefault();

    // TODO: remove the 'runInInjectionContext' wrapper when we remove the ponyfill import
    const fileHandles = await runInInjectionContext<Promise<FileSystemFileHandle[]>>(this._injector, () =>
      showOpenFilePicker(this.options())
    ).catch(console.error); // TODO: what do we do with errors?

    if (fileHandles) {
      this.files.emit(fileHandles);
    }
  }
}

export default OpenFilePicker;
