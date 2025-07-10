// prettier-ignore
// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
export const showOpenFilePicker = globalThis.showOpenFilePicker ?? (await import('./ponyfills/show-open-file-picker')).showOpenFilePicker;
