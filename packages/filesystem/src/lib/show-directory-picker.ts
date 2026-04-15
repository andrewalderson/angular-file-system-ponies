// // prettier-ignore
// // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
// globalThis.showDirectoryPicker = globalThis.showDirectoryPicker ?? (await import('./ponyfills/show-directory-picker')).showDirectoryPicker;

// Getting a build error for the top-level await but only occasionally so going old school
(async () => {
  // prettier-ignore
  // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
  globalThis.showDirectoryPicker = globalThis.showDirectoryPicker ?? (await import('./ponyfills/show-directory-picker')).showDirectoryPicker;
})();
