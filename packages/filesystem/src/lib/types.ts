// These are types that are missing from ES2022.
// They should be included in ES2023 so they can be removed once our Angular version
// uses ES2023 as its compile target
export type FileSystemPermissionMode = 'read' | 'readwrite';

export type FileSystemHandlePermissionDescriptor = {
  mode: FileSystemPermissionMode;
};

export type WellKnownDirectory = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';

export type StartInDirectory = WellKnownDirectory | FileSystemHandle;

export type FilePickerAcceptType = {
  description: string;
  accept: Record<`${Lowercase<string>}/${Lowercase<string>}`, `.${Lowercase<string>}` | `.${Lowercase<string>}`[]>;
};

export type FilePickerOptions = {
  id?: string;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  startsIn?: StartInDirectory;
};

export type OpenFilePickerOptions = FilePickerOptions & {
  multiple?: boolean;
};

export type DirectoryPickerOptions = {
  id: string;
  startIn: StartInDirectory;
  mode: FileSystemPermissionMode;
};
