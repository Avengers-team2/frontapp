"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ApiError, createAnalysisInput } from "@/api/analysis/analysis.api";
import {
    AnalysisFormValues, BUSINESS_STATUSES, DEFAULT_VALUES, NOTE_MAX,
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

export default function AnalysisFormContainer() {
    const { control, register, handleSubmit, setValue } = useForm<AnalysisFormValues>({ defaultValues: DEFAULT_VALUES });

    const values = useWatch({ control }) as AnalysisFormValues;

    const set = (patch: Partial<AnalysisFormValues>) => {
        (Object.keys(patch) as (keyof AnalysisFormValues)[]).forEach((key) =>
            setValue(key, patch[key] as never, { shouldDirty: true }),
        );
    };
    const done = countRequiredDone(values);
    const canSubmit = done === REQUIRED_TOTAL;

    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

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
                monthly_rent_max: data.monthlyRentMax,
                interior_budget_max: data.interiorBudgetMax,
                store_size: data.storeSize || null,
                operating_times: data.operatingTimes,
                target_ages: data.targetAges,
                target_gender: data.targetGender || null,
                business_status: data.businessStatus,
                is_franchise: data.isFranchise || null,
                franchise_brand: data.franchiseBrand || null,
                extra_note: data.extraNote.trim() || null,
            });
            router.push(`/analysis/result/${input_id}`);
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                alert("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
                router.push("/login");
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
                            />
                        </FormSection>

                        <FormSection id="budget" title="창업 예산" required>
                            <BudgetForm
                                value={{
                                    depositMin: values.depositMin,
                                    depositMax: values.depositMax,
                                    monthlyRentMax: values.monthlyRentMax,
                                    interiorBudgetMax: values.interiorBudgetMax,
                                }}
                                onChange={(v) => set(v)}
                            />
                        </FormSection>

                        <FormSection id="size" title="매장 규모">
                            <StoreSizeSelect value={values.storeSize} onChange={(v) => set({ storeSize: v })} />
                        </FormSection>

                        <FormSection id="time" title="운영 시간" hint="복수 선택">
                            <ChipGroup multiple options={OPERATING_TIMES} value={values.operatingTimes}
                                onChange={(v) => set({ operatingTimes: v })} />
                        </FormSection>

                        <FormSection id="target" title="주요 타깃 고객층">
                            <p className="mb-3 text-[15px] font-semibold text-ink-800">
                                연령대 <span className="ml-1 text-[13px] font-normal text-ink-300">복수 선택</span>
                            </p>
                            <ChipGroup multiple options={TARGET_AGES} value={values.targetAges}
                                onChange={(v) => set({ targetAges: v })} />
                            <p className="mb-3 mt-8 text-[15px] font-semibold text-ink-800">성별</p>
                            <ChipGroup options={TARGET_GENDERS} value={values.targetGender}
                                onChange={(v) => set({ targetGender: v })} />
                        </FormSection>

                        <FormSection id="status" title="사업자 상태" required>
                            <ChipGroup options={BUSINESS_STATUSES} value={values.businessStatus}
                                onChange={(v) => set({ businessStatus: v })} />
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
                            disabled={!canSubmit || submitting || values.extraNote.length > NOTE_MAX}
                            className="mt-6 w-full rounded-full bg-linear-to-r from-main to-sub py-5 text-[18px] font-bold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {submitting ? "분석 요청 중..." : "분석 시작하기 →"}
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
