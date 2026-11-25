"use client"

import useAuthStore from "@/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { SubmitEvent, useState } from "react";
import { updateProfileApi } from "../_lib/profile.api";
import { errorClass, helperClass, inputClass, labelClass, secondaryButtonClass, sectionTitleClass } from "./fieldStyle";

interface PasswordChangeFormProps {
    onChanged: () => void;
}

// 영문 · 숫자 · 특수문자를 섞어 8자 이상
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// 비밀번호 변경
export default function PasswordChangeForm({onChanged}: PasswordChangeFormProps) {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");

    const isRuleError = next.length > 0 && !PASSWORD_RULE.test(next);
    const isMismatch = confirm.length > 0 && next !== confirm;
    const user = useAuthStore((state) => state.user);

    // 새 비밀번호 저장 (PUT /users/{user_id}, user_password만 보냄)
    // TODO: 백엔드가 현재 비밀번호를 확인하지 않음 → 확인 기능이 생기면 current도 같이 보내기
    const passwordMutation = useMutation({
        mutationFn: () => updateProfileApi(user!.user_id, { user_password: next }),
        onSuccess: () => {
            setCurrent("");
            setNext("");
            setConfirm("");
            onChanged();
        },
        onError: (error) => window.alert(error.message),
    });

    const canSubmit = current.length > 0 && PASSWORD_RULE.test(next) && next === confirm && !passwordMutation.isPending;

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        if (!user) {
            window.alert("로그인 정보가 없어요. 다시 로그인해 주세요.");
            return;
        }
        passwordMutation.mutate();
    }

    return (
        <form id="password" onSubmit={handleSubmit} className="scroll-mt-34">
            <h2 className={sectionTitleClass}>비밀번호 변경</h2>

            <label className="mt-8 block">
                <p className={labelClass}>현재 비밀번호</p>
                <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`mt-3 ${inputClass}`} />
            </label>

            <label className="mt-7 block">
                <p className={labelClass}>새 비밀번호</p>
                <input
                    type="password"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    className={`mt-3 ${inputClass} ${isRuleError ? "border-danger" : ""}`}
                />
                <p className={isRuleError ? errorClass : helperClass}>영문 · 숫자 · 특수문자를 섞어 8자 이상</p>
            </label>

            <label className="mt-7.5 block">
                <p className={labelClass}>새 비밀번호 확인</p>
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`mt-3 ${inputClass} ${isMismatch ? "border-danger" : ""}`}
                />
                {isMismatch && <p className={errorClass}>새 비밀번호와 일치하지 않아요. 확인 후 다시 입력해 주세요.</p>}
            </label>

            <button type="submit" disabled={!canSubmit} className={`mt-12 ${secondaryButtonClass} disabled:opacity-40`}>
                비밀번호 변경
            </button>
        </form>
    );
}
