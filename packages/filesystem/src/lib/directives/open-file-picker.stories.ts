import { Component, computed, input, signal } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';
import { OpenFilePicker } from './open-file-picker';

@Component({
  selector: 'lib-open-file-picker-host',
  imports: [OpenFilePicker],
  template: `<button
      type="button"
      libOpenFilePicker
      [libOpenFilePickerOptions]="options()"
      (libOpenFilePickerFiles)="files.set($event)"
    >
      Open
    </button>
    <ul>
      @for(file of files(); track file;) {
      <li>{{ file.name }}</li>
      }
    </ul> `,
  styles: `
    :host {
      display: block;
      margin: 20px;
    }
  `,
})
export class OpenFilePickerHost {
  files = signal<FileSystemFileHandle[]>([]);

  options = computed(() => {
    return { multiple: this.multiple() };
  });

  multiple = input<boolean>();
}

const meta: Meta<OpenFilePickerHost> = {
  title: 'Open File Picker',
  component: OpenFilePickerHost,
  args: {
    multiple: false,
  },
};

export default meta;
type Story = StoryObj<OpenFilePickerHost>;

export const WithDefaults: Story = {};
