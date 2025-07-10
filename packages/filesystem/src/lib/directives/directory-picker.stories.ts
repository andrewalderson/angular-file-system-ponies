import { Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';
import { FileSystemDirectoryHandle } from '../file-system-directory-handle';
import { DirectoryPicker } from './directory-picker';

@Component({
  selector: 'lib-directory-picker-host',
  imports: [DirectoryPicker],
  template: `<button type="button" libDirectoryPicker (libDirectoryPickerDirectory)="handleDirectory($event)">
    Open
  </button>`,
  styles: `
    :host {
      display: block;
      margin: 20px;
    }
  `,
})
export class DirectoryPickerHost {
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);

  private _listElement: HTMLUListElement | null = null;

  protected async handleDirectory(directory: FileSystemDirectoryHandle) {
    this._listElement?.remove();
    this._listElement = this._renderer.createElement('ul');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this._processDirectory(directory, this._listElement!);

    this._renderer.appendChild(this._elementRef.nativeElement, this._listElement);
  }

  private async _processDirectory(directory: FileSystemDirectoryHandle, parentElement: HTMLUListElement) {
    const listitem: HTMLElement = this._renderer.createElement('li');
    listitem.textContent = directory.name;
    this._renderer.appendChild(parentElement, listitem);
    const list = this._renderer.createElement('ul');
    this._renderer.appendChild(parentElement, list);

    for await (const [key, value] of directory.entries()) {
      if (value.kind === 'directory') {
        const directoryHandle = await directory.getDirectoryHandle(key);
        await this._processDirectory(directoryHandle, list);
      } else if (value.kind === 'file') {
        const fileHandle = await directory.getFileHandle(key);
        const listitem: HTMLElement = this._renderer.createElement('li');
        listitem.textContent = fileHandle.name;
        this._renderer.appendChild(list, listitem);
      }
    }
  }
}

const meta: Meta<DirectoryPickerHost> = {
  title: 'Directory Picker',
  component: DirectoryPickerHost,
};

export default meta;
type Story = StoryObj<DirectoryPickerHost>;

export const WithDefaults: Story = {};
