import { ApiResponseDTO } from "@/types/common/common.type";
import { ImageUploadResponse, UploadFolder } from "@/types/upload/upload.type";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`;

// 이미지 업로드 (원본 + 썸네일) — POST /upload/images
export const uploadImageApi = async (file: File, folder: UploadFolder): Promise<ApiResponseDTO<ImageUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    // FormData는 Content-Type을 직접 넣지 않음 (브라우저가 boundary까지 붙여 줌)
    const response = await fetch(`${BASE_URL}/images`, {
        method: "POST",
        credentials: "include",
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail ?? "uploadImageApi fetching Error");
    }
    const datas: ApiResponseDTO<ImageUploadResponse> = await response.json();
    return datas;
};
