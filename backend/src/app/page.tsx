/**
 * 목적: 백엔드 워크스페이스의 기본 진입 문구를 보여준다.
 * 설명: 이 앱은 API 서버 역할만 수행하므로 운영자용 안내 메시지만 출력한다.
 * 적용 패턴: 정적 페이지 패턴
 * 참조: backend/src/app/api
 */
export default function BackendHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#09090B",
        color: "#FAFAFA",
        fontFamily: "sans-serif",
      }}
    >
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
          AI Agent Hub Mock API
        </h1>
        <p>/api 경로를 통해 데이터에 접근할 수 있습니다.</p>
      </div>
    </main>
  );
}
