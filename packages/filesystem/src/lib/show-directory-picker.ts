// prettier-ignore
// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
export const showDirectoryPicker = globalThis.showDirectoryPicker ?? (await import('./ponyfills/show-directory-picker')).showDirectoryPicker;
