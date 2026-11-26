"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import type { AreaLocateItem, StoreItem } from "@/api/analysis/analysis.api";
import { loadKakaoSdk, type PlacePoint } from "@/lib/kakaoMap";

// 상권 폴리곤 스타일. 색·투명도를 바꾸려면 여기만 고치면 된다.
const POLYGON_STYLE = {
  fillColor: "#0B7468",
  fillOpacity: 0.25,
  strokeColor: "#0B7468",
  strokeStyle: "dash",
  strokeWeight: 3,
  strokeOpacity: 1,
};
// 여러 상권이 같이 보일 때 선택되지 않은 상권은 연하게
const POLYGON_DIM_STYLE = { ...POLYGON_STYLE, fillOpacity: 0.08, strokeOpacity: 0.5, strokeWeight: 2 };

// 상권이 아닌 위치를 검색했을 때 주변을 대충 둘러 보여주는 원
const AROUND_RADIUS_M = 300;
const AROUND_STYLE = {
  strokeColor: "#64748B",
  strokeStyle: "dash",
  strokeWeight: 2,
  strokeOpacity: 0.8,
  fillColor: "#64748B",
  fillOpacity: 0.1,
};

// ── 점포 마커 ──
// 일반 점포는 작은 남색 점, 프랜차이즈는 주황 마름모, 내 브랜드는 더 크고 진한 테두리의 주황 마름모로 구분한다.
const STORE_COLORS = { same: "#1F3A5F", franchise: "#F5A524", mine: "#0B1B33" };
// 점포가 이만큼 이상이면 가까운 것끼리 묶어서 보여준다
const CLUSTER_FROM = 30;

const svgUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const STORE_ICONS = {
  same: {
    src: svgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><circle cx="7" cy="7" r="5.5" fill="${STORE_COLORS.same}" stroke="white" stroke-width="2"/></svg>`,
    ),
    size: 14,
  },
  franchise: {
    src: svgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M10 1.5 18.5 10 10 18.5 1.5 10Z" fill="${STORE_COLORS.franchise}" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`,
    ),
    size: 20,
  },
  mine: {
    src: svgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M16 2 30 16 16 30 2 16Z" fill="${STORE_COLORS.franchise}" stroke="${STORE_COLORS.mine}" stroke-width="3" stroke-linejoin="round"/><circle cx="16" cy="16" r="3.5" fill="${STORE_COLORS.mine}"/></svg>`,
    ),
    size: 32,
  },
};

// 마커를 누르면 뜨는 설명 카드. 점포 이름 같은 글자는 textContent 로만 넣어서 HTML 로 해석되지 않게 한다.
function buildStoreCard(store: StoreItem, onClose: () => void): HTMLElement {
  const card = document.createElement("div");
  card.className = "w-60 rounded-xl bg-white p-3 text-xs text-ink-700 shadow-lg ring-1 ring-line";

  const head = document.createElement("div");
  head.className = "flex items-start justify-between gap-2";
  const title = document.createElement("b");
  title.className = "text-sm font-bold text-ink-900";
  title.textContent = [store.name, store.branch].filter(Boolean).join(" ");
  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "닫기");
  close.className = "shrink-0 cursor-pointer text-ink-400 hover:text-ink-900";
  close.textContent = "✕";
  close.addEventListener("click", onClose);
  head.append(title, close);
  card.append(head);

  const lines: string[] = [];
  if (store.brand) lines.push(`브랜드 ${store.brand}${store.is_my_brand ? " (내 브랜드)" : ""}`);
  const floor = store.floor == null || store.floor === "" ? "" : /^-?\d+$/.test(String(store.floor)) ? `${store.floor}층` : String(store.floor);
  const meta = [store.category, floor].filter(Boolean).join(" · ");
  if (meta) lines.push(meta);
  if (store.address) lines.push(store.address);
  lines.forEach((text) => {
    const p = document.createElement("p");
    p.className = "mt-1 leading-relaxed";
    p.textContent = text;
    card.append(p);
  });
  return card;
}

type StoreGroups = { same: StoreItem[]; franchise: StoreItem[] };

type Props = {
  point: PlacePoint | null; // 검색한 위치 (마커)
  showAround?: boolean; // 검색한 위치 주변을 원으로 표시 (상권 밖일 때)
  areas: AreaLocateItem[]; // 그릴 상권들
  selectedCode: string | null; // 강조할 상권
  onSelect?: (code: string) => void; // 폴리곤 클릭
  stores?: StoreGroups | null; // 선택 업종의 점포 (일반 · 프랜차이즈)
};

type Drawn = { code: string; polygons: any[] };

export default function KakaoMap({ point, showAround = false, areas, selectedCode, onSelect, stores }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const drawnRef = useRef<Drawn[]>([]);
  const storeMarkersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const storeCardRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 지도 생성
  useEffect(() => {
    let alive = true;
    loadKakaoSdk().then((kakao) => {
      if (!alive || !containerRef.current || mapRef.current) return;
      mapRef.current = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(37.5244, 127.0236),
        level: 3,
      });
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 검색 위치/상권이 바뀌면 이전 것을 지우고 새로 그린다
  useEffect(() => {
    if (!ready) return;
    const kakao = window.kakao;
    const map = mapRef.current;

    markerRef.current?.setMap(null);
    markerRef.current = null;
    circleRef.current?.setMap(null);
    circleRef.current = null;
    drawnRef.current.forEach((d) => d.polygons.forEach((p) => p.setMap(null)));
    drawnRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();

    if (point) {
      const pos = new kakao.maps.LatLng(point.lat, point.lng);
      markerRef.current = new kakao.maps.Marker({ position: pos, map });
      bounds.extend(pos);

      if (showAround) {
        circleRef.current = new kakao.maps.Circle({ map, center: pos, radius: AROUND_RADIUS_M, ...AROUND_STYLE });
        const cb = circleRef.current.getBounds();
        bounds.extend(cb.getSouthWest());
        bounds.extend(cb.getNorthEast());
      }
    }

    areas.forEach((area) => {
      const polygons = area.kakao_polygons.map((rings) => {
        // 고리 배열을 그대로 path 로: 첫 번째가 바깥, 나머지는 구멍
        const path = rings.map((ring) => ring.map((p) => new kakao.maps.LatLng(p.lat, p.lng)));
        path[0].forEach((latlng: any) => bounds.extend(latlng));
        const polygon = new kakao.maps.Polygon({
          map,
          path,
          ...POLYGON_DIM_STYLE,
        });
        kakao.maps.event.addListener(polygon, "click", () => onSelectRef.current?.(area.code));
        return polygon;
      });
      drawnRef.current.push({ code: area.code, polygons });
    });

    if (areas.length > 0 || (point && showAround)) map.setBounds(bounds);
    else if (point) {
      map.setCenter(new kakao.maps.LatLng(point.lat, point.lng));
      map.setLevel(4);
    }
  }, [ready, point, showAround, areas]);

  // 선택된 상권만 진하게
  useEffect(() => {
    drawnRef.current.forEach((d) => {
      const style = d.code === selectedCode ? POLYGON_STYLE : POLYGON_DIM_STYLE;
      d.polygons.forEach((p) => p.setOptions(style));
    });
  }, [selectedCode, areas, point, ready]);

  // 점포 마커: 업종이 바뀌어 stores 가 바뀌면 이전 마커를 지우고 새로 그린다. 폴리곤 위에 겹쳐 보인다.
  useEffect(() => {
    if (!ready) return;
    const kakao = window.kakao;
    const map = mapRef.current;

    const clear = () => {
      storeCardRef.current?.setMap(null);
      storeCardRef.current = null;
      clustererRef.current?.clear();
      clustererRef.current = null;
      storeMarkersRef.current.forEach((m) => m.setMap(null));
      storeMarkersRef.current = [];
    };
    clear();
    if (!stores) return clear;

    const closeCard = () => {
      storeCardRef.current?.setMap(null);
      storeCardRef.current = null;
    };
    const image = (key: keyof typeof STORE_ICONS) => {
      const icon = STORE_ICONS[key];
      return new kakao.maps.MarkerImage(icon.src, new kakao.maps.Size(icon.size, icon.size), {
        offset: new kakao.maps.Point(icon.size / 2, icon.size / 2),
      });
    };
    const images = { same: image("same"), franchise: image("franchise"), mine: image("mine") };

    const make = (store: StoreItem, key: keyof typeof STORE_ICONS) => {
      const position = new kakao.maps.LatLng(store.lat, store.lng);
      const marker = new kakao.maps.Marker({
        position,
        image: images[key],
        title: store.name,
        zIndex: key === "mine" ? 3 : key === "franchise" ? 2 : 1,
      });
      kakao.maps.event.addListener(marker, "click", () => {
        closeCard();
        storeCardRef.current = new kakao.maps.CustomOverlay({
          map,
          position,
          content: buildStoreCard(store, closeCard),
          yAnchor: 1.25,
          zIndex: 10,
        });
      });
      return marker;
    };

    // 내 브랜드 점포는 프랜차이즈 중에서도 더 크게 보이고, 묶음 안에 숨지 않도록 항상 따로 그린다
    const mine = stores.franchise.filter((s) => s.is_my_brand).map((s) => make(s, "mine"));
    const markers = [
      ...stores.same.map((s) => make(s, "same")),
      ...stores.franchise.filter((s) => !s.is_my_brand).map((s) => make(s, "franchise")),
    ];
    storeMarkersRef.current = [...markers, ...mine];
    mine.forEach((m) => m.setMap(map));

    if (markers.length + mine.length >= CLUSTER_FROM && kakao.maps.MarkerClusterer) {
      clustererRef.current = new kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 4,
        minClusterSize: 3,
        // 묶음 표시 (카카오 클러스터러 설정값)
        styles: [
          {
            width: "40px",
            height: "40px",
            background: "rgba(31, 58, 95, 0.88)",
            borderRadius: "20px",
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            lineHeight: "40px",
          },
        ],
      });
      clustererRef.current.addMarkers(markers);
    } else {
      markers.forEach((m) => m.setMap(map));
    }

    // 지도의 빈 곳을 누르면 설명 카드를 닫는다
    kakao.maps.event.addListener(map, "click", closeCard);
    return () => {
      kakao.maps.event.removeListener(map, "click", closeCard);
      clear();
    };
  }, [ready, stores]);

  return <div ref={containerRef} className="absolute inset-0 z-[0]" />;
}
