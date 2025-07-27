import { useNavigate } from 'react-router-dom';

export default function TicketReceipt() {
  const navigate = useNavigate();

  const handleNext = () => {

    navigate('/'); // 메인 페이지로 이동
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎟️ 티켓 발권 완료</h2>

      <p style={styles.message}>
        <strong>영수증을 자세히 읽어주세요!</strong><br />
        짐 보관 및 착석 안내는 아래 단계를 따르시면 됩니다.
      </p>

{/* 
      <img
        src="/imgs/receipt_flow.png"
        alt="티켓 → 영수증 → QR코드 → 사이트 접속 흐름"
        style={styles.image}
      />
*/}

      <div style={styles.steps}>
        <p>① 티켓과 함께 발급된 영수증을 확인하세요.</p>
        <p>② 영수증에 있는 <strong>QR코드</strong>를 스캔하세요.</p>
        <p>③ 해당 사이트에서 <strong>짐 보관 위치</strong>와 <strong>착석 코드</strong>를 확인하세요.</p>
      </div>

      <button onClick={handleNext} style={styles.button}>
        확인했어요 →
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 32,               // 여유 있게
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: 36,              // 28 -> 36으로 크게
    marginBottom: 16,
  },
  message: {
    fontSize: 22,              // 18 -> 22로 키움
    lineHeight: 1.8,
    marginBottom: 28,
  },
  image: {
    width: '90%',
    maxWidth: 500,             // 약간 키움
    margin: '0 auto 28px',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  steps: {
    textAlign: 'left',
    margin: '0 auto',
    maxWidth: 500,             // 좀 더 넓게
    fontSize: 20,              // 16 -> 20으로 키움
    lineHeight: 1.9,
    background: '#f9f9f9',
    padding: 24,               // 여유 있게
    borderRadius: 8,
    border: '1px solid #ddd',
  },
  button: {
    marginTop: 40,
    padding: '16px 32px',      // 더 큼직하게
    fontSize: 22,              // 16 -> 22
    borderRadius: 10,
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

