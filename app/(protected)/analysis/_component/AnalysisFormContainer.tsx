"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import ProgressCard from "./ProgressCard";
import SectionNav from "./SectionNav";
import StoreSizeSelect from "./StoreSizeSelect";
import AreaSearch from "./AreaSearch";

const REQUIRED_TOTAL = SECTIONS.filter((s) => s.required).length;
function countRequiredDone(v: AnalysisFormValues) {
    return [
        v.areaCode !== "",
        v.industrySmall !== "",
        v.depositMax > 0,
        v.businessStatus !== "",
    ].filter(Boolean).length;
}

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

    const done = countRequiredDone(values);
    const canSubmit = done === REQUIRED_TOTAL;

    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isNavigating, startNavigation] = useTransition();
    const busy = submitting || isNavigating;

    const onSubmit = async (data: AnalysisFormValues) => {
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
            startNavigation(() => router.push(`/analysis/result/${input_id}?${query}`));
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                alert("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
                router.push(toLoginHref());
            } else {
                alert(e instanceof Error ? e.message : "분석 요청에 실패했어요. 잠시 후 다시 시도해 주세요.");
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
                        <p className="mt-6 text-[18px] text-mist-100">5분이면 상권 분석과 지원사업 매칭 결과를 받아볼 수 있어요.</p>
                    </div>
                    <ProgressCard done={done} total={REQUIRED_TOTAL} />
                </div>
            </section>

            <div className="bg-white px-[5%]">
                <div className="mx-auto flex w-full max-w-[1440px] gap-16 pb-24">
                    <SectionNav />

                    <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 flex-1 pt-10">
                        <FormSection id="status" title="분석 목적" required>
                            <ChipGroup options={BUSINESS_STATUSES} value={values.businessStatus}
                                onChange={(v) => set({ businessStatus: v })} />
                        </FormSection>

                        <FormSection id="area" title="희망 지역" required>
                            <AreaSearch
                                areaName={values.areaName}
                                selected={values.areaCode !== ""}
                                onSelect={(a) => set({ areaCode: a.code, areaName: a.name })}
                                onClear={() => set({ areaCode: "", areaName: "" })}
                            />
                        </FormSection>

                        <FormSection id="industry" title="업종" required>
                            <IndustrySelect
                                value={{ large: values.industryLarge, mid: values.industryMid, small: values.industrySmall }}
                                onChange={(v) => set({ industryLarge: v.large, industryMid: v.mid, industrySmall: v.small })}
                                statusOf={statusOf}
                            />
                        </FormSection>

                        <FormSection id="franchise" title="프랜차이즈 여부">
                            <FranchiseField
                                isFranchise={values.isFranchise}
                                brand={values.franchiseBrand}
                                brandCategory={values.franchiseCategory}
                                onChangeIsFranchise={(v) => set({ isFranchise: v })}
                                onChangeBrand={(b) => set({ franchiseBrand: b.name, franchiseCategory: b.category })}
                            />
                        </FormSection>

                        <FormSection id="budget" title="창업 예산" required>
                            <BudgetForm
                                value={{ depositMin: values.depositMin, depositMax: values.depositMax }}
                                onChange={(v) => set(v)}
                            />
                        </FormSection>

                        <FormSection id="size" title="매장 규모">
                            <StoreSizeSelect value={values.storeSize} onChange={(v) => set({ storeSize: v })} />
                        </FormSection>

                        <FormSection id="time" title="운영 시간" hint="복수 선택">
                            <ChipGroup multiple allLabel="전체" allExclude={["미정"]} options={OPERATING_TIMES}
                                value={values.operatingTimes} onChange={(v) => set({ operatingTimes: v })} />
                        </FormSection>

                        <FormSection id="target" title="주요 타깃 고객층">
                            <p className="mb-3 text-[15px] font-semibold text-ink-800">
                                연령대 <span className="ml-1 text-[13px] font-normal text-ink-300">복수 선택</span>
                            </p>
                            <ChipGroup multiple allLabel="전체" options={TARGET_AGES} value={values.targetAges}
                                onChange={(v) => set({ targetAges: v })} />
                            <p className="mb-3 mt-8 text-[15px] font-semibold text-ink-800">성별</p>
                            <ChipGroup multiple allLabel="전체" options={TARGET_GENDERS} value={values.targetGenders}
                                onChange={(v) => set({ targetGenders: v })} />
                        </FormSection>

                        <FormSection id="note" title="추가 의견" hint="선택"
                            description="분석할 때 함께 참고할 내용을 자유롭게 적어 주세요. 입력한 의견은 분석 요청과 함께 저장돼요.">
                            <div className={`rounded-lg border p-4 ${values.extraNote.length > NOTE_MAX ? "border-danger" : "border-line focus-within:border-sub"}`}>
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
                                <p className="mt-2 text-[13px] text-danger">{NOTE_MAX}자까지 입력할 수 있어요. {values.extraNote.length - NOTE_MAX}자를 줄여 주세요.</p>
                            )}
                        </FormSection>

                        <button
                            type="submit"
                            disabled={!canSubmit || busy || values.extraNote.length > NOTE_MAX}
                            className="mt-6 w-full rounded-full bg-linear-to-r from-main to-sub py-5 text-[18px] font-bold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy ? "분석 요청 중..." : "분석 시작하기 →"}
                        </button>
                        {!canSubmit && (
                            <p className="mt-3 text-center text-[13px] text-ink-300">필수 항목 4개를 모두 입력하면 분석을 시작할 수 있어요.</p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
