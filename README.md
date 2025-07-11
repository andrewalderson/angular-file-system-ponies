# Angular File System Ponies

Angular directives and ponyfills for working with the File System API

- [showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)
- [showSaveFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker)
- [showDirectoryPicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)

As well, Dropzone directive and a polyfill for DataTransferItem [`getAsFileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle).

These pony/poly fills aim to provide a consistant api in browsers (Firefox and Safari as of 2025) that have not implemented these apis yet. They are designed to be easily removed without affecting the functionality of the directives once these apis are implemented in all browsers supported by your Angular project version.

See the Storybook stories for each directive for implementation details.

NOTE: this repository is meant as a reference only and will not be released as an npm package. If you want to use them, you will need to copy the code into your project and edit them as needed.
