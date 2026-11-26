"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FieldMessage, goToField, shakeClass } from "@/components/form/FormMotion";
import { toLoginHref } from "@/lib/loginRedirect";
import { useForm, useWatch } from "react-hook-form";
import { ApiError, createAnalysisInput, getAreaIndustries, type IndustryStatus } from "@/api/analysis/analysis.api";
import {
    AnalysisFormValues, BUSINESS_STATUSES, DEFAULT_VALUES, FORM_DRAFT_KEY, FORM_RESTORE_KEY, NOTE_MAX,
    OPERATING_TIMES, SECTIONS, TARGET_AGES, TARGET_GENDERS,
} from "./analysis.data";
import BudgetForm from "./BudgetForm";
import ChipGroup from "./ChipGroup";
import FormSection from "./FormSection";
import FranchiseField from "./FranchiseField";
import IndustrySelect from "./IndustrySelect";
import LiquidSubmitButton from "./LiquidSubmitButton";
import ProgressCard from "./ProgressCard";
import SectionNav from "./SectionNav";
import StoreSizeSelect from "./StoreSizeSelect";
import AreaSearch from "./AreaSearch";

const REQUIRED_TOTAL = SECTIONS.filter((s) => s.required).length;
// 채워야 하는 칸들 (화면 순서대로). missing 이면 버튼을 눌렀을 때 흔들리고 그 칸으로 이동한다
function getFields(v: AnalysisFormValues) {
    return [
        { name: "status", section: "status", message: "분석 목적을 선택해 주세요.", missing: v.businessStatus === "" },
        { name: "area", section: "area", message: "상권을 검색해서 선택해 주세요.", missing: v.areaCode === "" },
        { name: "industry", section: "industry", message: "업종을 소분류까지 선택해 주세요.", missing: v.industrySmall === "" },
        { name: "franchise", section: "franchise", message: "프랜차이즈 여부를 선택해 주세요.", missing: v.isFranchise === "" },
        // 프랜차이즈가 "예"면 브랜드까지 골라야 한다
        { name: "brand", section: "franchise", message: "브랜드를 검색해서 선택해 주세요.", missing: v.isFranchise === "예" && v.franchiseBrand === "" },
        { name: "deposit", section: "budget", message: "보증금을 입력해 주세요.", missing: !(v.depositMax > 0) },
        { name: "size", section: "size", message: "매장 규모를 선택해 주세요.", missing: v.storeSize === "" },
        { name: "time", section: "time", message: "운영 시간을 선택해 주세요.", missing: v.operatingTimes.length === 0 },
        { name: "ages", section: "target", message: "연령대를 선택해 주세요.", missing: v.targetAges.length === 0 },
        { name: "gender", section: "target", message: "성별을 선택해 주세요.", missing: v.targetGenders.length === 0 },
        { name: "note", section: "note", message: `${NOTE_MAX}자 이하로 줄여 주세요.`, missing: v.extraNote.length > NOTE_MAX },
    ] as const;
}
type FieldName = ReturnType<typeof getFields>[number]["name"];
const fieldId = (name: string) => `analysis-field-${name}`;

function toGender(genders: string[]) {
    if (genders.length === 0) return null;
    return genders.length === 1 ? genders[0] : "상관없음";
}

function restoreDraft(saved: Partial<AnalysisFormValues> & { targetGender?: string }): AnalysisFormValues {
    const { targetGender, ...rest } = saved;
    const merged = { ...DEFAULT_VALUES, ...rest };
    const genders = merged.targetGenders.length > 0 ? merged.targetGenders
        : targetGender === "상관없음" ? [...TARGET_GENDERS]
        : targetGender && TARGET_GENDERS.includes(targetGender) ? [targetGender] : [];
    return {
        ...merged,
        targetGenders: genders,
        businessStatus: BUSINESS_STATUSES.includes(merged.businessStatus) ? merged.businessStatus : "",
    };
}

export default function AnalysisFormContainer() {
    const { control, register, handleSubmit, setValue, reset } = useForm<AnalysisFormValues>({ defaultValues: DEFAULT_VALUES });

    const values = useWatch({ control }) as AnalysisFormValues;

    // 결과 화면에서 "조건 수정"으로 들어왔으면 직전에 제출한 입력값을 채워 둔다.
    // useWatch 가 구독을 시작한 뒤에 reset 해야 values 가 따라 바뀐다 (그래서 이 위치).
    useEffect(() => {
        try {
            if (!sessionStorage.getItem(FORM_RESTORE_KEY)) return;
            sessionStorage.removeItem(FORM_RESTORE_KEY);
            const saved = sessionStorage.getItem(FORM_DRAFT_KEY);
            if (saved) reset(restoreDraft(JSON.parse(saved) as Partial<AnalysisFormValues>));
        } catch {
            // 저장된 값이 없거나 깨졌으면 빈 입력창으로 둔다
        }
    }, [reset]);

    const set = (patch: Partial<AnalysisFormValues>) => {
        (Object.keys(patch) as (keyof AnalysisFormValues)[]).forEach((key) =>
            setValue(key, patch[key] as never, { shouldDirty: true }),
        );
    };
    // 메인·서비스 소개의 "체크 시작"으로 온 주소(?address=)는 희망 지역 검색창에 넣고 목록을 연다.
    // 상권은 자동으로 고르지 않는다(맞는 상권이 없을 수 있어서). 다른 입력값은 그대로 둔다.
    const [areaRequest, setAreaRequest] = useState<{ text: string } | null>(null);
    useEffect(() => {
        const address = new URLSearchParams(window.location.search).get("address")?.trim();
        if (!address) return;
        // 화면 이동 뒤의 스크롤이 끝난 다음에 처리한다
        const timer = window.setTimeout(() => {
            window.history.replaceState(null, "", window.location.pathname); // 새로고침해도 다시 덮어쓰지 않게
            setValue("areaCode", "");
            setValue("areaName", "");
            setAreaRequest({ text: address });
            goToField(fieldId("area"));
        }, 300);
        return () => window.clearTimeout(timer);
    }, [setValue]);

    // 선택한 상권 기준으로 업종마다 분석 가능 여부를 받아 온다. 실패해도 선택·분석에는 영향이 없다 (표시만 빠진다)
    const { data: areaIndustries } = useQuery({
        queryKey: ["areaIndustries", values.areaCode],
        queryFn: () => getAreaIndustries(values.areaCode),
        enabled: values.areaCode !== "",
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
    const statusMap = useMemo(() => {
        const map = new Map<string, IndustryStatus>();
        for (const item of areaIndustries ?? []) {
            for (const f of item.frontIndustries) map.set(`${f.large}|${f.mid}|${f.small ?? ""}`, item.status);
        }
        return map;
    }, [areaIndustries]);
    // 서버 매핑과 같은 순서로 찾는다: (대, 중, 소) 먼저, 없으면 (대, 중, 중분류 전체)
    const statusOf = (large: string, mid: string, small: string) =>
        values.areaCode === "" ? undefined : (statusMap.get(`${large}|${mid}|${small}`) ?? statusMap.get(`${large}|${mid}|`));

    const fields = getFields(values);
    const missing = fields.filter((f) => f.missing);
    // 입력 현황: 필수 구역 중 빠진 칸이 없는 구역 수
    const done = SECTIONS.filter((s) => s.required && !missing.some((f) => f.section === s.id)).length;

    // 빈 칸이 있는 채로 버튼을 누른 횟수(흔들림)와, 그때 비어 있던 칸들(빨간 표시 대상)
    const [shakeKey, setShakeKey] = useState(0);
    const [markedNames, setMarkedNames] = useState<FieldName[]>([]);
    // 표시한 칸만 빨갛게 하고, 채우는 즉시 풀린다
    const errorOf = (name: FieldName) => markedNames.includes(name) && missing.some((f) => f.name === name);
    const messageOf = (name: FieldName) => (errorOf(name) ? fields.find((f) => f.name === name)?.message : null);
    const shake = (name: FieldName) => shakeClass(shakeKey, errorOf(name));
    // 벗어났다 돌아오면 오류 표시는 지운다 (입력한 값은 그대로 남는다)
    useEffect(() => {
        return () => {
            setShakeKey(0);
            setMarkedNames([]);
        };
    }, []);

    // 버튼이 원래 자리(폼 끝)에 도착하면 가로로 꽉 채운다.
    // 아래 56px 은 버튼의 bottom-14 와 같고, 위는 크게 잡아 화면 위로 지나간 경우도 도착으로 본다
    const dockRef = useRef<HTMLDivElement>(null);
    const [docked, setDocked] = useState(false);
    useEffect(() => {
        const el = dockRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setDocked(entry.isIntersecting), {
            rootMargin: "100000px 0px -56px 0px",
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [isNavigating, startNavigation] = useTransition();
    const busy = submitting || isNavigating;

    const onSubmit = async (data: AnalysisFormValues) => {
        // 빈 칸이 있으면 흔들고 첫 번째 빈 칸으로 부드럽게 이동한다
        if (missing.length > 0) {
            setMarkedNames(missing.map((f) => f.name));
            setShakeKey((k) => k + 1);
            window.setTimeout(() => goToField(fieldId(missing[0].name)), 200);
            return;
        }
        setSubmitting(true);
        try {
            const { input_id } = await createAnalysisInput({
                trdar_cd: data.areaCode,
                industry_large: data.industryLarge,
                industry_mid: data.industryMid,
                industry_small: data.industrySmall,
                deposit_min: data.depositMin,
                deposit_max: data.depositMax,
                monthly_rent_max: null,
                interior_budget_max: null,
                store_size: data.storeSize || null,
                operating_times: data.operatingTimes,
                target_ages: data.targetAges,
                target_gender: toGender(data.targetGenders),
                business_status: data.businessStatus,
                is_franchise: data.isFranchise || null,
                franchise_brand: data.franchiseBrand || null,
                extra_note: data.extraNote.trim() || null,
            });
            // "조건 수정"으로 돌아올 때 되살릴 수 있게 입력값을 남긴다
            try {
                sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(data));
            } catch {
                // 저장소를 못 써도 분석 진행에는 영향 없음
            }
            // 선택한 상권 코드·업종을 URL 에 남긴다 (새로고침해도 결과 페이지가 같은 상권을 그린다)
            const query = new URLSearchParams({
                area: data.areaCode,
                areaName: data.areaName,
                industry: data.industrySmall,
            });
            // 프랜차이즈 브랜드를 골랐으면 결과 화면이 같은 브랜드 점포를 강조할 수 있게 함께 남긴다
            if (data.isFranchise === "예" && data.franchiseBrand) query.set("brand", data.franchiseBrand);
            // 요청은 끝났으니 submitting 은 풀고, 화면 이동이 끝날 때까지는 isNavigating 이 버튼을 막는다.
            // (이동 뒤 입력 화면으로 돌아와도 "요청 중" 상태가 남지 않게 하려고)
            setSubmitting(false);
            // 버튼의 완료 체크가 보이도록 잠깐 기다렸다가 이동한다
            setSent(true);
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            await new Promise((resolve) => setTimeout(resolve, reduced ? 100 : 400));
            // 기다리는 사이에 다른 페이지로 나갔으면 결과 화면으로 끌고 가지 않는다
            if (window.location.pathname !== "/analysis") {
                setSent(false);
                return;
            }
            startNavigation(() => {
                router.push(`/analysis/result/${input_id}?${query}`);
                // 전환과 함께 반영되므로, 화면이 바뀌기 전까지는 완료 모양이 유지된다
                setSent(false);
            });
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
                router.push(toLoginHref());
            } else {
                alert(e instanceof Error ? e.message : "분석 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            }
            setSubmitting(false);
        }
    };

    return (
        <>
            <section className="relative overflow-hidden bg-navy-950 px-[5%] pt-20">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[url('/assets/images/analysis/hero-bg.jpg')] bg-cover bg-center"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/70 to-transparent" />
                <div className="relative mx-auto flex h-[300px] w-full max-w-[1440px] items-center justify-between">
                    <div>
                        <p className="text-[17px] text-mist-300">홈 › 상권 분석</p>
                        <h1 className="mt-5 text-[52px] font-bold tracking-tight text-white">
                            어디에서, 어떤 가게를 <span className="text-mint">열고 싶으세요?</span>
                        </h1>
                        <p className="mt-6 text-[18px] text-mist-100">5분이면 상권 분석과 지원사업 매칭 결과를 받아볼 수 있습니다.</p>
                    </div>
                    <ProgressCard done={done} total={REQUIRED_TOTAL} />
                </div>
            </section>

            <div className="bg-white px-[5%]">
                <div className="mx-auto flex w-full max-w-[1440px] gap-16 pb-24">
                    <SectionNav />

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        // 다 채우기 전에는 입력칸에서 Enter 를 눌러도 제출되지 않게 한다
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target instanceof HTMLInputElement && missing.length > 0) e.preventDefault();
                        }}
                        noValidate
                        className="min-w-0 flex-1 pt-10"
                    >
                        <FormSection id="status" title="분석 목적" required>
                            <div id={fieldId("status")} className={shake("status")}>
                                <ChipGroup options={BUSINESS_STATUSES} value={values.businessStatus}
                                    invalid={errorOf("status")} onChange={(v) => set({ businessStatus: v })} />
                            </div>
                            <FieldMessage message={messageOf("status")} />
                        </FormSection>

                        <FormSection id="area" title="희망 지역" required>
                            <div id={fieldId("area")} className={shake("area")}>
                                <AreaSearch
                                    areaName={values.areaName}
                                    selected={values.areaCode !== ""}
                                    invalid={errorOf("area")}
                                    openRequest={areaRequest}
                                    onSelect={(a) => set({ areaCode: a.code, areaName: a.name })}
                                    onClear={() => set({ areaCode: "", areaName: "" })}
                                />
                            </div>
                            <FieldMessage message={messageOf("area")} />
                        </FormSection>

                        <FormSection id="industry" title="업종" required>
                            <div id={fieldId("industry")} className={shake("industry")}>
                                <IndustrySelect
                                    value={{ large: values.industryLarge, mid: values.industryMid, small: values.industrySmall }}
                                    invalid={errorOf("industry")}
                                    onChange={(v) => set({ industryLarge: v.large, industryMid: v.mid, industrySmall: v.small })}
                                    statusOf={statusOf}
                                />
                            </div>
                            <FieldMessage message={messageOf("industry")} />
                        </FormSection>

                        <FormSection id="franchise" title="프랜차이즈 여부" required>
                            <FranchiseField
                                isFranchise={values.isFranchise}
                                brand={values.franchiseBrand}
                                brandCategory={values.franchiseCategory}
                                onChangeIsFranchise={(v) => set({ isFranchise: v })}
                                onChangeBrand={(b) => set({ franchiseBrand: b.name, franchiseCategory: b.category })}
                                fieldId={fieldId}
                                shake={shake}
                                errorOf={errorOf}
                                messageOf={messageOf}
                            />
                        </FormSection>

                        <FormSection id="budget" title="창업 예산" required>
                            <BudgetForm
                                value={{ depositMin: values.depositMin, depositMax: values.depositMax }}
                                onChange={(v) => set(v)}
                                fieldId={fieldId}
                                shake={shake}
                                messageOf={messageOf}
                            />
                        </FormSection>

                        <FormSection id="size" title="매장 규모" required>
                            <div id={fieldId("size")} className={shake("size")}>
                                <StoreSizeSelect value={values.storeSize} invalid={errorOf("size")}
                                    onChange={(v) => set({ storeSize: v })} />
                            </div>
                            <FieldMessage message={messageOf("size")} />
                        </FormSection>

                        <FormSection id="time" title="운영 시간" hint="복수 선택" required>
                            <div id={fieldId("time")} className={shake("time")}>
                                <ChipGroup multiple allLabel="전체" allExclude={["미정"]} options={OPERATING_TIMES}
                                    value={values.operatingTimes} invalid={errorOf("time")}
                                    onChange={(v) => set({ operatingTimes: v })} />
                            </div>
                            <FieldMessage message={messageOf("time")} />
                        </FormSection>

                        <FormSection id="target" title="주요 타깃 고객층" required>
                            <div id={fieldId("ages")}>
                                <p className="mb-3 text-[15px] font-semibold text-ink-800">
                                    연령대 <span className="ml-1 text-[13px] font-normal text-ink-300">복수 선택</span>
                                </p>
                                <div className={shake("ages")}>
                                    <ChipGroup multiple allLabel="전체" options={TARGET_AGES} value={values.targetAges}
                                        invalid={errorOf("ages")} onChange={(v) => set({ targetAges: v })} />
                                </div>
                                <FieldMessage message={messageOf("ages")} />
                            </div>
                            <div id={fieldId("gender")} className="mt-8">
                                <p className="mb-3 text-[15px] font-semibold text-ink-800">성별</p>
                                <div className={shake("gender")}>
                                    <ChipGroup multiple allLabel="전체" options={TARGET_GENDERS} value={values.targetGenders}
                                        invalid={errorOf("gender")} onChange={(v) => set({ targetGenders: v })} />
                                </div>
                                <FieldMessage message={messageOf("gender")} />
                            </div>
                        </FormSection>

                        <FormSection id="note" title="추가 의견" hint="선택"
                            description="분석할 때 함께 참고할 내용을 자유롭게 적어 주세요. 입력한 의견은 분석 요청과 함께 저장됩니다.">
                            <div id={fieldId("note")} className={`${shake("note")} rounded-lg border p-4 ${values.extraNote.length > NOTE_MAX ? "border-danger" : "border-line focus-within:border-sub"}`}>
                                <textarea
                                    {...register("extraNote")}
                                    rows={4}
                                    placeholder="텍스트를 입력하세요."
                                    className="w-full resize-none text-[15px] outline-none placeholder:text-ink-200"
                                />
                                <p className={`text-right text-[13px] ${values.extraNote.length > NOTE_MAX ? "text-danger" : "text-ink-300"}`}>
                                    {values.extraNote.length} / {NOTE_MAX}자
                                </p>
                            </div>
                            {values.extraNote.length > NOTE_MAX && (
                                <p className="mt-2 text-[13px] text-danger">{NOTE_MAX}자까지 입력할 수 있습니다. {values.extraNote.length - NOTE_MAX}자를 줄여 주세요.</p>
                            )}
                        </FormSection>

                        {/* 스크롤하는 동안 화면 오른쪽 아래에 붙어 따라다니고, 폼 끝에서는 제자리에 멈춘다 (푸터를 덮지 않는다) */}
                        <div className="pointer-events-none sticky bottom-14 z-20 mt-6">
                            <LiquidSubmitButton
                                state={sent ? "ok" : busy ? "load" : "idle"}
                                disabled={busy || sent}
                                label="분석 시작하기 →"
                                doneLabel="분석 요청 완료"
                                expanded={docked}
                            />
                        </div>
                        {/* 버튼의 원래 자리 표시 */}
                        <div ref={dockRef} aria-hidden className="h-px" />
                    </form>
                </div>
            </div>
        </>
    );
}
