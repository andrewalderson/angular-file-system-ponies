// prettier-ignore
// // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
// globalThis.showSaveFilePicker = globalThis.showSaveFilePicker ?? (await import('./ponyfills/show-save-file-picker')).showSaveFilePicker;

// Getting a build error for the top-level await but only occasionally so going old school
(async () => {
  // prettier-ignore
  // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
  globalThis.showSaveFilePicker = globalThis.showSaveFilePicker ?? (await import('./ponyfills/show-save-file-picker')).showSaveFilePicker;
})();
