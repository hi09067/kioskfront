import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import createInstance from "../axios/Interceptor";
import useUserStore from '../store/useUserStore';

export default function KioskAwarenessSurvey() {
  const serverUrl = import.meta.env.VITE_BACK_SERVER;
  const axiosInstance = createInstance();
  const navigate = useNavigate();

  // ✅ store에서 필요한 값 모두 가져오기
  const {
    viewDate,
    nickName,
    gender,     // 성별
    age,        // 나이대 → ageGroup
    region,     // 거주지 → residence
    income,     // 월 소득 → monthlyIncome
    reasons = [],      // 관람 이유(배열)
    customReason = '', // 기타 입력
  } = useUserStore();

  const [answers, setAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [confirmUnlocked, setConfirmUnlocked] = useState(false); // ★ 한번 통과하면 이후부터 바로 제출

  function handleChange(event) {
    const { name, value } = event.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  }

  function buildParticipationReason() {
    let final = reasons.slice();
    if (final.includes('기타') && customReason.trim()) {
      final = final.filter(r => r !== '기타').concat(customReason.trim());
    }
    return final.join(', ');
  }

  function handleSubmit(event) {
    event.preventDefault();

    // 최초 한 번만 3단계 확인
    if (!confirmUnlocked) {
      if (!window.confirm('제출하시겠습니까?')) return;
      if (!window.confirm('정말요?')) return;
      if (!window.confirm('진짜 제출합니다?')) return;
      setConfirmUnlocked(true); // 이후부터는 확인 없이 바로 진행
    }

    // 제출 직전 store 스냅샷
    const snap = useUserStore.getState();
    console.log('[submit/store]', {
      nickName: snap.nickName,
      viewDate: snap.viewDate,
      gender: snap.gender,
      age: snap.age,
      region: snap.region,
      income: snap.income,
      reasons: snap.reasons,
      customReason: snap.customReason,
    });

    if (Object.values(answers).some(answer => !answer)) {
      alert('모든 문항에 응답해주세요.');
      return;
    }

    // participationReason 만들기 (store 기반)
    const finalReasons = (() => {
      const base = Array.isArray(snap.reasons) ? [...snap.reasons] : [];
      if (base.includes('기타') && (snap.customReason || '').trim()) {
        return base.filter(r => r !== '기타').concat(snap.customReason.trim());
      }
      return base;
    })();

    const receiptInfo = {
      nickName: snap.nickName,
      viewDate: snap.viewDate,

      // 🔽 서버 DTO 필드명과 정확히 동일
      gender: snap.gender || '',
      ageGroup: snap.age || '',
      residence: snap.region || '',
      monthlyIncome: snap.income || '',
      participationReason: finalReasons.join(', '),

      surveyAnswerList: Object.entries(answers).map(([_, v], idx) => ({
        questionId: idx + 1,
        answerScore: parseInt(v, 10),
      })),
    };

    setIsLoading(true);

    axiosInstance.post(serverUrl + '/receipt', receiptInfo, {
      headers: { 'Content-Type': 'application/json' },
      transformRequest: [(data) => JSON.stringify(data)],
    })
      .then(() => navigate('/receipt'))
      .catch((err) => {
        alert('제출에 실패했습니다. 다시 시도해주세요.');
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }

  function renderScaleQuestion(label, name) {
    return (
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 16 }}>{label}</p>
        <div style={{ display: 'flex', gap: 20, fontSize: 24 }}>
          {[1, 2, 3, 4, 5].map(value => (
            <label key={value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="radio"
                name={name}
                value={value}
                checked={answers[name] === String(value)}
                onChange={handleChange}
                style={{ width: 28, height: 28, marginBottom: 8 }}
              />
              {value}
            </label>
          ))}
        </div>
        <div style={{ fontSize: 18, color: '#555', marginTop: 8 }}>
          <span>1: 전혀 아니다</span> &nbsp;&nbsp;
          <span>5: 매우 그렇다</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', padding: 40, fontFamily: 'sans-serif' }}>
      {/* ✅ 로딩 오버레이 */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 'bold',
            pointerEvents: 'auto'
          }}
        >
          ⏳ 응답을 전송 중입니다...
        </div>
      )}

      <h2 style={{ fontSize: 36, marginBottom: 40, textAlign: 'center' }}>잠깐만요! 여러분의 의견이 필요해요</h2>
      <form onSubmit={handleSubmit}>
        {renderScaleQuestion(
          'Q1. 키오스크 사용으로 인해 발생한 사회적 문제(차별, 불편 등)에 대해 생각해보았다.',
          'q1'
        )}
        {renderScaleQuestion(
          'Q2. 뉴스나 인터넷에서 키오스크와 관련된 문제를 접하고 관심을 가졌다.',
          'q2'
        )}
        {renderScaleQuestion(
          'Q3. 키오스크가 누구에게는 불편할 수 있다고 생각한다.',
          'q3'
        )}
        {renderScaleQuestion(
          'Q4. 키오스크를 이용할 때 조작 방법이 헷갈리거나 어려웠던 적이 있다.',
          'q4'
        )}
        {renderScaleQuestion(
          'Q5. 줄 서 있는 상황에서 뒤에 있는 사람을 의식해 조급함을 느낀 적이 있다.',
          'q5'
        )}
        {renderScaleQuestion(
          'Q6. 키오스크의 화면 구성이나 글씨 크기 때문에 불편함을 느낀 적이 있다.',
          'q6'
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 40,
              padding: '20px 40px',
              borderRadius: 12,
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              fontSize: 24,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: 240,
              height: 80,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}
