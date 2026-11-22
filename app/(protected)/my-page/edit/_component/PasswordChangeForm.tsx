"use client"

import { SubmitEvent, useState } from "react";
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
    const canSubmit = current.length > 0 && PASSWORD_RULE.test(next) && next === confirm;

    // TODO: 비밀번호 변경 API 연결
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        setCurrent("");
        setNext("");
        setConfirm("");
        onChanged();
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
