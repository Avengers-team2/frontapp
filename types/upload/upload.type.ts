// 이미지 업로드 응답 (POST /upload/images)
// 백엔드 DTO가 카멜 alias를 쓰고 있어서 두 이름 모두 받을 수 있게 둠
export interface ImageUploadResponse {
    originalKey?: string | null;
    thumbKey?: string | null;
    originalUrl?: string | null;
    thumbUrl?: string | null;
    original_key?: string | null;
    thumb_key?: string | null;
    original_url?: string | null;
    thumb_url?: string | null;
}

// S3 저장 폴더 (백엔드 S3Folder enum과 같은 값)
export type UploadFolder = "post" | "profile" | "report";
