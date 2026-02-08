import api from "./client";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImageFile(file) {
  const dataUrl = await fileToDataUrl(file);
  const { data } = await api.post("/uploads/image", {
    file: dataUrl,
    filename: file.name,
  });
  return data?.data?.image?.url;
}
