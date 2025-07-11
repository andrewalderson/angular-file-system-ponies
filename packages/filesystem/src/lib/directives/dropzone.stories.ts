import { Component, ElementRef, inject, Renderer2, signal } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';
import { Dropzone } from './dropzone';

@Component({
  selector: 'lib-dropzone-host',
  imports: [Dropzone],
  template: `<div
    libDropzone
    [class.active]="active()"
    (libDropzoneEnter)="active.set(true)"
    (libDropzoneLeave)="active.set(false)"
    (libDropzoneFiles)="handleFiles($event)"
  >
    <p>Drop files here</p>
  </div>`,
  styles: `
    :host {
      display: block;
      width: 100%;

      > div {
        align-content: center;
        height: 200px;
        border: 2px solid grey;

        &.active {
          border-color: blue;
        }

        > p {
          text-align: center;
        }
      }
    }
  `,
})
export class DropzoneHost {
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);

  active = signal(false);

  private _listElement: HTMLUListElement | null = null;

  async handleFiles(handles: FileSystemFileHandle[] | FileSystemDirectoryHandle[]) {
    this.active.set(false);
    this._listElement?.remove();
    this._listElement = this._renderer.createElement('ul');

    for await (const handle of handles) {
      const item: HTMLElement = this._renderer.createElement('li');
      if (handle.kind === 'file') {
        item.textContent = `File: ${handle.name}`;
      } else if (handle.kind === 'directory') {
        item.textContent = `Directory: ${handle.name}`;
      }
      this._renderer.appendChild(this._listElement, item);
    }

    this._renderer.appendChild(this._elementRef.nativeElement, this._listElement);
  }
}

const meta: Meta<DropzoneHost> = {
  title: 'Dropzone',
  component: DropzoneHost,
};

export default meta;
type Story = StoryObj<DropzoneHost>;

export const WithDefaults: Story = {};
