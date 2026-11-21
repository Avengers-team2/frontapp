import ResultContainer from "./_component/ResultContainer";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // id가 바뀌면 상태를 새로 시작하도록 key를 준다. 실제 조회 연동 시 이 값을 사용한다.
  return <ResultContainer key={id} />;
}
