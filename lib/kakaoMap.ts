/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer`;

let sdkPromise: Promise<any> | null = null;

// 카카오 SDK를 한 번만 불러오고, 로드가 끝나면 window.kakao 를 돌려준다. (services, clusterer 라이브러리 포함)
export function loadKakaoSdk(): Promise<any> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const ready = () => window.kakao.maps.load(() => resolve(window.kakao));
    if (window.kakao?.maps?.services) return resolve(window.kakao);
    if (window.kakao?.maps) return ready();
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.onload = ready;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("카카오 지도를 불러오지 못했어요."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export type PlacePoint = { lat: number; lng: number; name: string };

// 키워드 장소검색. 첫 번째 결과를 돌려주고, 결과가 없으면 null.
export async function searchPlace(keyword: string): Promise<PlacePoint | null> {
  const kakao = await loadKakaoSdk();
  return new Promise((resolve, reject) => {
    new kakao.maps.services.Places().keywordSearch(keyword, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const p = data[0];
        resolve({ lat: Number(p.y), lng: Number(p.x), name: p.place_name });
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        resolve(null);
      } else {
        reject(new Error("장소 검색 중 오류가 발생했어요."));
      }
    });
  });
}
