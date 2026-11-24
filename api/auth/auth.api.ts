import { LoginRequestDTO, SignUpRequestDTO } from "@/types/auth/auth.type"
import { ApiResponseDTO } from "@/types/common/common.type"

// 로그인 함수
export const loginApi = async (loginRequestDTO: LoginRequestDTO): Promise<ApiResponseDTO> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // 쿠키를 주고 받을 때 옵션 허용
        body: JSON.stringify(loginRequestDTO)
    })

    if(!response.ok) throw new Error("")
    const datas: ApiResponseDTO = await response.json()
    return datas
}

// 로그아웃 함수
export const logoutApi = async (): Promise<ApiResponseDTO> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    if(!response.ok) {
        throw new Error("logoutApi fetching Error")
    }
    const datas: ApiResponseDTO = await response.json();
    return datas
}



// 회원가입 함수
export const signUpApi = async (signUpRequestDTO: SignUpRequestDTO): Promise<ApiResponseDTO> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(signUpRequestDTO)
    })

    if(!response.ok) throw new Error("회원가입에 실패했습니다.")
    const datas: ApiResponseDTO = await response.json()
    return datas
}


// 이메일 중복 확인 함수 (data가 true면 사용 가능)
export const checkEmailApi = async (email: string): Promise<ApiResponseDTO> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check-email?user_email=${encodeURIComponent(email)}`,
        { credentials: "include" }
    )

    if(!response.ok) throw new Error("이메일 중복 확인에 실패했습니다.")
    const datas: ApiResponseDTO = await response.json()
    return datas
}

// 내 정보 조회 함수 (로그인 직후 헤더 등에 user를 채울 때 사용)
export const getMeApi = async (): Promise<ApiResponseDTO> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
        method: "POST",
        credentials: "include"
    })

    if(!response.ok) throw new Error("내 정보를 불러오지 못했습니다.")
    const datas: ApiResponseDTO = await response.json()
    return datas
}
