// prettier-ignore
// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
globalThis.showOpenFilePicker = globalThis.showOpenFilePicker ?? (await import('./ponyfills/show-open-file-picker')).showOpenFilePicker;

// If you get a build error from the top-level await above use this async function instead
// (async () => {
//   // prettier-ignore
//   // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
//   globalThis.showOpenFilePicker = globalThis.showOpenFilePicker ?? (await import('./ponyfills/show-open-file-picker')).showOpenFilePicker;
// })();
