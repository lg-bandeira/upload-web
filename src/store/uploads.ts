import { create } from "zustand";
import { uploadFileToStorage } from "../http/upload-file-to-storage";

export type Upload = {
  name: string;
  file: File;
};

type UploadState = {
  uploads: Map<string, Upload>;
  addUploads: (files: File[]) => void;
};

export const useUploads = create<UploadState>((set, get) => {
  async function processUpload(uploadId: string) {
    const upload = get().uploads.get(uploadId);

    if (!upload) {
      return;
    }

    await uploadFileToStorage({ file: upload.file });
  }

  function addUploads(files: File[]) {
    for (const file of files) {
      const uploadId = crypto.randomUUID();

      const upload: Upload = {
        name: file.name,
        file,
      };

      set((state) => {
        return {
          uploads: state.uploads.set(uploadId, upload),
        };
      });

      processUpload(uploadId);
    }
  }

  return {
    uploads: new Map(),
    addUploads,
  };
});
