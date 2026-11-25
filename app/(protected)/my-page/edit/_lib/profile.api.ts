import { ApiResponseDTO } from "@/types/common/common.type";
import { User } from "@/types/user";

// 회원정보 수정 요청 (PUT /users/{user_id}, 보낸 값만 수정됨)
// TODO: user 담당자가 api/user/user.api.ts에 같은 함수를 만들면 그걸로 교체
export interface ProfileUpdateRequest {
    user_nickname?: string;
    user_business_status?: string;
    user_interest_region?: string | null;
    user_interest_industry?: string | null;
    user_password?: string;
}

// 회원정보 수정 — 로그인한 본인만 가능
export const updateProfileApi = async (userId: number, body: ProfileUpdateRequest): Promise<ApiResponseDTO<User>> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("회원정보를 저장하지 못했습니다.");
    const datas: ApiResponseDTO<User> = await response.json();
    return datas;
};

// 회원 탈퇴 (DELETE /users/{user_id}) — 로그인한 본인만 가능
export const withdrawApi = async (userId: number): Promise<ApiResponseDTO> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) throw new Error("회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    const datas: ApiResponseDTO = await response.json();
    return datas;
};
