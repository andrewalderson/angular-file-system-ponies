import { Directive, ElementRef, inject, NgZone, OnDestroy, OnInit, output, Renderer2, signal } from '@angular/core';

@Directive({
  selector: '[libDropzone]',
  exportAs: 'libDropzone',
})
export class Dropzone implements OnInit, OnDestroy {
  static {
    (async function () {
      await import('../polyfills/data-transfer-item');
    })();
  }

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly _ngZone = inject(NgZone);

  private readonly _renderer = inject(Renderer2);

  readonly enter = output<void>({ alias: 'libDropzoneEnter' });
  readonly leave = output<void>({ alias: 'libDropzoneLeave' });
  readonly files = output<FileSystemFileHandle[]>({ alias: 'libDropzoneFiles' });

  // TODO do we need a signal here
  protected _active = signal(false);

  private _unlistenFns: VoidFunction[] | null = null;

  ngOnInit() {
    this._unlistenFns = this._ngZone.runOutsideAngular(() => [
      this._renderer.listen(this._elementRef.nativeElement, 'dragenter', this._handleDragEnter.bind(this)),
      this._renderer.listen(this._elementRef.nativeElement, 'dragleave', this._handleDragLeave.bind(this)),
      this._renderer.listen(this._elementRef.nativeElement, 'dragover', (event) => event.preventDefault()),
      this._renderer.listen(this._elementRef.nativeElement, 'drop', this._handleFileDrop.bind(this)),
    ]);
  }

  ngOnDestroy() {
    this._unlistenFns?.forEach((unlisten) => unlisten());
    this._unlistenFns = null;
  }

  private _handleDragEnter(event: DragEvent) {
    event.preventDefault();
    if (this._active()) {
      return;
    }
    this._active.set(true);
    this._ngZone.run(() => this.enter.emit());
  }

  private _handleDragLeave(event: DragEvent) {
    event.preventDefault();
    const dropzoneElement = this._elementRef.nativeElement;
    if (!dropzoneElement.contains(event.relatedTarget as Node)) {
      this._active.set(false);
      this._ngZone.run(() => this.leave.emit());
    }
  }

  private _handleFileDrop(event: DragEvent) {
    event.preventDefault();
    this._active.set(false);
    // This will not be null because the event is being dispatched by the browser
    // instead of constructed using the `new DragEvent()` constructor.
    // We will check anyway to avoid any potential issues and to keep TypeScript happy
    if (!event.dataTransfer) {
      return;
    }

    const fileHandlesPromises = Array.from(event.dataTransfer.items)
      // We are polyfilling the `getAsFileSystemHandle` method above so we can safely call it
      // @ts-expect-error: `getAsFileSystemHandle` is not defined in the type definitions
      .map((item) => item.getAsFileSystemHandle());

    Promise.all(fileHandlesPromises).then((fileHandles) => this._ngZone.run(() => this.files.emit(fileHandles)));
  }
}
