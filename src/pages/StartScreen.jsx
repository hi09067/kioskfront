import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import posterImg from '../assets/imgs/poster.png';
import useUserStore from '../store/useUserStore';

export default function StartScreen() {
  const navigate = useNavigate();

  // useUserStore 초기화
  const resetUser = useUserStore((state) => state.resetUser);

  useEffect(() => {
    resetUser(); // 컴포넌트 진입 시 유저 정보 초기화
  }, []);

  function handleStartClick() {
    console.log("클릭 이벤트 발생");
    navigate('/showtime');
  }

  return (
    <>
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>

      <div style={styles.container} onClick={handleStartClick}>
        <img src={posterImg} alt="키오스크는 어려워 포스터" style={styles.poster} />
        <div style={styles.overlayText}>터치하면 다음 화면으로 넘어갑니다.</div>
      </div>
    </>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '800px',
    height: '1160px',
    overflow: 'hidden',
    cursor: 'pointer',
     margin: '0 auto',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // 포스터가 꽉 차도록
  },
  overlayText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(0,0,0,0.7)',
    animation: 'blink 1.2s infinite',
    pointerEvents: 'none', // 텍스트가 클릭 이벤트를 막지 않도록
  },
};

// 🔑 blink 애니메이션은 글로벌 CSS로 추가해주세요:
