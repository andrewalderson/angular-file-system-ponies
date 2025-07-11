// prettier-ignore
// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
export const showSaveFilePicker = globalThis.showSaveFilePicker ?? (await import('./ponyfills/show-save-file-picker')).showSaveFilePicker;
