import type { AreaSearchItem, BrandSearchItem } from "./analysis.api";

const area = (i: number, name: string, gu: string, dong: string): AreaSearchItem => ({
    code: `MOCK-${String(i).padStart(3, "0")}`, name, gu, dong,
});

export const AREA_MOCK: AreaSearchItem[] = [
    area(1, "신사동 가로수길", "강남구", "신사동"),
    area(2, "압구정로데오역", "강남구", "신사동"),
    area(3, "강남역", "강남구", "역삼1동"),
    area(4, "선릉역", "강남구", "역삼2동"),
    area(5, "삼성역", "강남구", "삼성1동"),
    area(6, "성수동 카페거리", "성동구", "성수2가1동"),
    area(7, "서울숲", "성동구", "성수1가1동"),
    area(8, "연남동", "마포구", "연남동"),
    area(9, "망원동", "마포구", "망원1동"),
    area(10, "홍대입구역", "마포구", "서교동"),
    area(11, "합정역", "마포구", "합정동"),
    area(12, "이태원역", "용산구", "이태원1동"),
    area(13, "경리단길", "용산구", "이태원2동"),
    area(14, "용리단길", "용산구", "한강로동"),
    area(15, "익선동", "종로구", "종로1·2·3·4가동"),
    area(16, "을지로3가역", "중구", "을지로동"),
    area(17, "건대입구역", "광진구", "화양동"),
    area(18, "송리단길", "송파구", "송파1동"),
    area(19, "잠실새내역", "송파구", "잠실2동"),
    area(20, "샤로수길", "관악구", "청룡동"),
    area(21, "신촌역", "서대문구", "신촌동"),
    area(22, "문래동 창작촌", "영등포구", "문래동"),
    area(23, "여의도역", "영등포구", "여의동"),
    area(24, "노원역", "노원구", "상계6·7동"),
];

const brand = (i: number, name: string, category: string, aliasOf?: string): BrandSearchItem => ({
    id: `MOCK-B${String(i).padStart(3, "0")}`, name, category, aliasOf,
});

export const BRAND_MOCK: BrandSearchItem[] = [
    brand(1, "메가MGC커피", "외식 · 커피"),
    brand(2, "메가커피", "외식 · 커피", "메가MGC커피"),
    brand(3, "컴포즈커피", "외식 · 커피"),
    brand(4, "빽다방", "외식 · 커피"),
    brand(5, "이디야커피", "외식 · 커피"),
    brand(6, "이디야", "외식 · 커피", "이디야커피"),
    brand(7, "투썸플레이스", "외식 · 커피"),
    brand(8, "할리스", "외식 · 커피"),
    brand(9, "파리바게뜨", "외식 · 제과제빵"),
    brand(10, "뚜레쥬르", "외식 · 제과제빵"),
    brand(11, "배스킨라빈스", "외식 · 아이스크림/빙수"),
    brand(12, "설빙", "외식 · 아이스크림/빙수"),
    brand(13, "교촌치킨", "외식 · 치킨"),
    brand(14, "BBQ", "외식 · 치킨"),
    brand(15, "비비큐", "외식 · 치킨", "BBQ"),
    brand(16, "bhc", "외식 · 치킨"),
    brand(17, "맘스터치", "외식 · 패스트푸드"),
    brand(18, "본죽", "외식 · 한식"),
    brand(19, "CU", "도소매 · 편의점"),
    brand(20, "GS25", "도소매 · 편의점"),
    brand(21, "세븐일레븐", "도소매 · 편의점"),
];
