// prettier-ignore
// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
globalThis.showDirectoryPicker = globalThis.showDirectoryPicker ?? (await import('./ponyfills/show-directory-picker')).showDirectoryPicker;

// If you get a build error from the top-level await above use this async function instead
// (async () => {
//   // prettier-ignore
//   // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
//   globalThis.showDirectoryPicker = globalThis.showDirectoryPicker ?? (await import('./ponyfills/show-directory-picker')).showDirectoryPicker;
// })();
