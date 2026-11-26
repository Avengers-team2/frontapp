// 로그인이 필요해서 /login 으로 갈 때 "원래 있던 페이지"를 주소의 next 에 실어 보내고,
// 로그인에 성공하면 그 페이지로 돌려보낸다.

const NEXT_PARAM = "next";
// 로그인 뒤에 돌아가면 안 되는 곳 (로그인한 사람은 못 들어가는 페이지들)
const BLOCKED = ["/login", "/join", "/find-account"];

// 돌아갈 주소로 써도 안전한지 검사한다. 같은 사이트 안의 경로만 허용해서, 다른 사이트로 보내는 주소는 막는다.
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  const path = raw.split(/[?#]/)[0];
  if (BLOCKED.some((p) => path === p || path.startsWith(`${p}/`))) return "/";
  return raw;
}

// "/login?next=<돌아올 주소>". 돌아올 주소를 안 주면 지금 보고 있는 페이지(쿼리 포함)를 쓴다. 브라우저에서만 부른다.
export function toLoginHref(next?: string): string {
  const target = safeNextPath(next ?? `${window.location.pathname}${window.location.search}`);
  return target === "/" ? "/login" : `/login?${NEXT_PARAM}=${encodeURIComponent(target)}`;
}

// 로그인 페이지 주소에 실려 온 돌아갈 주소 (없거나 위험하면 "/"). 브라우저에서만 부른다.
export function readNextPath(): string {
  return safeNextPath(new URLSearchParams(window.location.search).get(NEXT_PARAM));
}
