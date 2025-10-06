import { create } from "zustand";
import { uploadFileToStorage } from "../http/upload-file-to-storage";

export type Upload = {
  name: string;
  file: File;
  abortController: AbortController;
  status: "progress" | "success" | "error" | "canceled";
};

type UploadState = {
  uploads: Map<string, Upload>;
  addUploads: (files: File[]) => void;
  cancelUpload: (uploadId: string) => void;
};

export const useUploads = create<UploadState>((set, get) => {
  async function processUpload(uploadId: string) {
    const upload = get().uploads.get(uploadId);

    if (!upload) {
      return;
    }

    try {
      await uploadFileToStorage({ file: upload.file }, { signal: upload.abortController.signal });

      set((state) => {
        return {
          uploads: state.uploads.set(uploadId, {
            ...upload,
            status: "success",
          }),
        };
      });
    } catch (error) {
      set((state) => {
        return {
          uploads: state.uploads.set(uploadId, {
            ...upload,
            status: "error",
          }),
        };
      });
    }
  }

  function cancelUpload(uploadId: string) {
    const upload = get().uploads.get(uploadId);

    if (!upload) {
      return;
    }

    upload.abortController.abort();

    set((state) => {
      return {
        uploads: state.uploads.set(uploadId, {
          ...upload,
          status: "canceled",
        }),
      };
    });
  }

  function addUploads(files: File[]) {
    for (const file of files) {
      const uploadId = crypto.randomUUID();
      const abortController = new AbortController();

      const upload: Upload = {
        name: file.name,
        file,
        abortController,
        status: "progress",
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
    cancelUpload,
  };
});
