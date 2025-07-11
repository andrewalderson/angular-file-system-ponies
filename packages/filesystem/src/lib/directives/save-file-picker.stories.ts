import { Component, ElementRef, viewChild } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';
import { FileSystemFileHandle } from '../file-system-file-handle';
import { SaveFilePickerOptions } from '../types';
import { SaveFilePicker } from './save-file-picker';

@Component({
  selector: 'lib-save-file-picker-host',
  imports: [SaveFilePicker],
  template: `<textarea #textarea placeholder="Type some text and press save"></textarea>
    <button
      type="button"
      libSaveFilePicker
      [libSaveFilePickerOptions]="options"
      (libSaveFilePickerFile)="saveFile($event)"
    >
      Save
    </button>`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      justify-content: middle;
    }

    textarea {
      width: 400px;
      height: 300px;
    }
  `,
})
export class SaveFilePickerHost {
  private _textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  protected options: SaveFilePickerOptions = {
    suggestedName: 'test.txt',
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': '.txt',
        },
      },
    ],
  };

  async saveFile(handle: FileSystemFileHandle) {
    const writable = await handle.createWritable();
    const writer = writable.getWriter();
    writer.write(this._textarea()?.nativeElement.value);
    writer.close();
  }
}

const meta: Meta<SaveFilePickerHost> = {
  title: 'Save File Picker',
  component: SaveFilePickerHost,
};

export default meta;
type Story = StoryObj<SaveFilePickerHost>;

export const WithDefaults: Story = {};
