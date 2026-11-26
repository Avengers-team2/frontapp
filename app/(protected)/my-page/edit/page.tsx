import LoginGuard from "@/components/common/LoginGuard";
import MemberEditContainer from "./_component/MemberEditContainer";

// 마이페이지 · 회원정보 수정 (비밀번호 변경 · 회원 탈퇴 포함)
export default function EditPage() {
    return (
        <LoginGuard>
            <MemberEditContainer />
        </LoginGuard>
    );
}
