import type { SaveFilePickerOptions } from '../types';

export async function showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle> {
  const { FileSystemFileHandle } = await import('../file-system-file-handle');
  const { WritableFileAdapter } = await import('./adapters');
  return new FileSystemFileHandle(new WritableFileAdapter(options?.suggestedName || ''));
}
