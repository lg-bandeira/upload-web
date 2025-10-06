import axios from "axios";

interface uploadFileToStorageParams {
  file: File;
}

export async function uploadFileToStorage({ file }: uploadFileToStorageParams) {
  const data = new FormData();

  data.append("file", file);

  const response = await axios.post<{ url: string }>("http://localhost:3333/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    url: response.data.url,
  };
}
