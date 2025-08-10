// src/pages/SurveyAll.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import createInstance from '../axios/Interceptor';
import useUserStore from '../store/useUserStore';

const demographicQuestions = [
  { label: '닉네임', type: 'text', name: 'nickname', options: null },
  { label: '성별', type: 'radio', name: 'gender', options: ['그 외', '여성', '남성'] },
  { label: '나이대', type: 'select', name: 'age', options: ['10대', '20대', '30대', '40대', '50대', '60대 이상'] },
  { label: '거주지', type: 'select', name: 'region', options: ['강남구, 서초구, 송파구', '용산구, 종로구, 마포구', '중구, 서대문구, 강동구', '양천구, 영등포구, 동작구', '성북구, 광진구, 노원구', '강서구, 구로구, 금천구, 관악구', '은평구, 도봉구, 강북구, 중랑구, 동대문구', '경기북부', '경기남부'] },
  { label: '월 소득', type: 'select', name: 'income', options: ['월 50만원 이하', '월 50~180만원', '월 180~230만원', '월 230~350만원', '월 350~470만원', '월 470~710만원', '월 710만원 이상'] },
];

const reasonOptions = [
  '배우가 좋아서',
  '리뷰가 좋아서',
  '티켓 가격이 저렴해서',
  '시간대가 맞아서',
  '지인의 추천',
  '기타',
];

export default function SurveyAll() {
  const navigate = useNavigate();
  const axios = createInstance();

  // store values & setters
  const {
    nickName: sNickName,
    gender: sGender,
    age: sAge,
    region: sRegion,
    income: sIncome,
    reasons: sReasons = [],
    customReason: sCustomReason = '',
    viewDate: sViewDate,
    setNickName,
    setGender,
    setAge,
    setRegion,
    setIncome,
    toggleReason,
    setCustomReason,
  } = useUserStore();

  // local UI state
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    age: '',
    region: '',
    income: '',
  });
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [customReason, setCustomReasonLocal] = useState('');

  // 첫 클릭 후 버튼을 우상단으로 이동 → 두 번째 클릭부터 진짜 제출
  const [movedTopRight, setMovedTopRight] = useState(false);

  // logs
  useEffect(() => {
    console.log('[SurveyAll mount] store snapshot:', {
      sNickName, sGender, sAge, sRegion, sIncome, sReasons, sCustomReason, sViewDate
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log('[SurveyAll formData changed]', formData, ' | store:', {
      sNickName, sGender, sAge, sRegion, sIncome
    });
  }, [formData, sNickName, sGender, sAge, sRegion, sIncome]);
  useEffect(() => {
    console.log('[SurveyAll reasons changed]', reasons, ' | store:', sReasons);
  }, [reasons, sReasons]);
  useEffect(() => {
    console.log('[SurveyAll customReason changed]', customReason, ' | store:', sCustomReason);
  }, [customReason, sCustomReason]);

  // field -> store setter
  const fieldSetterMap = {
    gender: setGender,
    age: setAge,
    region: setRegion,
    income: setIncome,
  };

  const handleDemographicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'nickname') {
      setNickName(value);
      setIsNicknameChecked(false);
      setIsDuplicateNickname(true);
    } else if (fieldSetterMap[name]) {
      fieldSetterMap[name](value);
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      Swal.fire('닉네임을 입력해주세요.', '', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACK_SERVER + '/isDuplicateNickname',
        formData.nickname,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const isDuplicate = response.data;

      if (isDuplicate) {
        setIsDuplicateNickname(true);
        setIsNicknameChecked(true);
        Swal.fire('중복된 닉네임입니다!', '다른 닉네임을 입력해주세요.', 'error');
      } else {
        setIsDuplicateNickname(false);
        setIsNicknameChecked(true);
        Swal.fire('사용 가능한 닉네임입니다.', '', 'success');
      }

      console.log('[nicknameCheck result]', { isDuplicate, formNickname: formData.nickname, storeNick: useUserStore.getState().nickName });
    } catch (error) {
      console.error('닉네임 중복 체크 에러', error);
      Swal.fire('오류', '닉네임 중복 체크 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnswered = (name) => formData[name] && String(formData[name]).trim() !== '';
  const allDemographicsAnswered = demographicQuestions.every((q) => isAnswered(q.name));

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    // local
    setReasons((prev) => (checked ? [...prev, value] : prev.filter((r) => r !== value)));

    // store toggle
    toggleReason(value);

    console.log('[onToggle reason]', {
      value, checked,
      localReasonsNext: checked ? [...reasons, value] : reasons.filter(r => r !== value),
      storeReasonsNext: useUserStore.getState().reasons
    });
  };

  const handleCustomReasonChange = (e) => {
    const v = e.target.value;
    setCustomReasonLocal(v);
    setCustomReason(v);
    console.log('[onChange customReason]', v, ' | store.customReason ->', useUserStore.getState().customReason);
  };

  //첫 클릭은 confirm+초기화(+텔레포트)만, 두 번째 클릭부터 실제 제출
  //첫 클릭은 confirm+초기화(+텔레포트)만, 두 번째 클릭부터 실제 제출
const handleReasonSubmit = (e) => {
    e.preventDefault();

    if (!movedTopRight) {
      const ok = window.confirm('초기화하시겠습니까?');
      if (ok) {
        // local reset
        setFormData({ nickname: '', gender: '', age: '', region: '', income: '' });
        setReasons([]);
        setCustomReasonLocal('');

        // store reset
        setNickName('');
        setGender('');
        setAge('');
        setRegion('');
        setIncome('');
        setCustomReason('');
        try {
          const curr = [...(useUserStore.getState().reasons || [])];
          curr.forEach((r) => toggleReason(r)); // 토글로 비우기
        } catch (_) {
          // ignore
        }

        // 닉네임 체크 상태 리셋
        setIsNicknameChecked(false);
        setIsDuplicateNickname(false);
      }

      // 텔레포트!
      setMovedTopRight(true);
      return; // ← 아직 제출 안 함
    }

    // 두 번째 클릭 이후: 실제 제출(기존 검증 유지)
    if (!isNicknameChecked) {
      Swal.fire('닉네임 중복 체크를 해주세요!', '', 'error');
      return;
    }

    let finalReasons = reasons;
    if (reasons.includes('기타') && customReason.trim()) {
      finalReasons = reasons.filter((r) => r !== '기타').concat(customReason.trim());
    }
    if (finalReasons.length === 0) {
      Swal.fire('오류', '참여 이유를 하나 이상 선택해주세요', 'error');
      return;
    }

    // ✅ 여기서 한 번 더 물어보기
    const okSubmit = window.confirm('제출하시겠습니까?');
    if (!okSubmit) return;

    // 보수적으로 닉 재동기화
    setNickName(formData.nickname);

    // 👉 실제 다음 단계로 이동
    navigate('/questions');
  };


  // 구린 폰트 공통
  const badFont = {
    fontFamily: '"Comic Sans MS", "Papyrus", cursive, fantasy, serif',
    letterSpacing: '0.6px',
    lineHeight: 1.2,
  };

  return (
    <>
      {/* 메인 내용 영역 */}
      <div
        style={{
          padding: 40,
          maxWidth: 560,
          margin: '40px auto',
          backgroundColor: '#f7f7f7',
          borderRadius: 2,
          boxShadow: '0 0 2px rgba(0,0,0,0.15)',
          ...badFont,
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 32,
            marginBottom: 32,
            color: '#333',
          }}
        >
          응답자 정보를 입력해주세요
        </h2>

        {demographicQuestions.map((question, index) => {
          const canShow = demographicQuestions.slice(0, index).every((q) => isAnswered(q.name));
          const isOdd = index % 2 === 1;

          return canShow ? (
            <div
              key={question.name}
              style={{
                marginBottom: 36,
                display: 'flex',
                flexDirection: isOdd ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <label
                htmlFor={question.name}
                style={{
                  flexBasis: '40%',
                  textAlign: isOdd ? 'right' : 'left',
                  fontWeight: '700',
                  fontSize: 22,
                  color: '#555',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {question.label}
              </label>

              <div
                style={{
                  flexBasis: isOdd ? '50%' : '55%',
                  textAlign: isOdd ? 'left' : 'right',
                }}
              >
                {question.type === 'text' && question.name === 'nickname' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id={question.name}
                      type="text"
                      name={question.name}
                      value={formData[question.name]}
                      onChange={handleDemographicChange}
                      style={{
                        flex: 1,
                        padding: 14,
                        fontSize: 20,
                        borderRadius: 8,
                        border: '2px solid #aaa',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                      onBlur={(e) => (e.target.style.borderColor = '#aaa')}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={handleNicknameCheck}
                      style={{
                        padding: '10px 16px',
                        fontSize: 16,
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      중복 체크
                    </button>
                  </div>
                )}

                {question.type === 'radio' &&
                  question.options.map((option) => (
                    <label
                      key={option}
                      style={{
                        marginRight: 16,
                        cursor: 'pointer',
                        fontSize: 20,
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="radio"
                        name={question.name}
                        value={option}
                        checked={formData[question.name] === option}
                        onChange={handleDemographicChange}
                        style={{
                          marginRight: 8,
                          cursor: 'pointer',
                          width: 24,
                          height: 24,
                        }}
                      />
                      {option}
                    </label>
                  ))}

                {question.type === 'select' && (
                  <select
                    name={question.name}
                    value={formData[question.name]}
                    onChange={handleDemographicChange}
                    style={{
                      width: '100%',
                      padding: 14,
                      fontSize: 20,
                      borderRadius: 8,
                      border: '2px solid #aaa',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      textAlignLast: 'center',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                    onBlur={(e) => (e.target.style.borderColor = '#aaa')}
                  >
                    <option value="">선택</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : null;
        })}

        {(allDemographicsAnswered || movedTopRight) && (
          <>
            <h2
              style={{
                marginTop: 48,
                textAlign: 'center',
                color: '#333',
                fontSize: 28,
                fontWeight: '700',
                marginBottom: 20,
              }}
            >
              관람 또는 참여 이유가 무엇입니까?
            </h2>

            <form onSubmit={handleReasonSubmit}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                {reasonOptions.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      cursor: 'pointer',
                      fontSize: 22,
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      value={reason}
                      checked={reasons.includes(reason)}
                      onChange={handleCheckboxChange}
                      style={{ cursor: 'pointer', width: 26, height: 26 }}
                    />
                    {reason}
                  </label>
                ))}
              </div>

              {reasons.includes('기타') && (
                <div style={{ marginBottom: 28 }}>
                  <label
                    htmlFor="customReason"
                    style={{
                      fontWeight: '700',
                      fontSize: 20,
                      marginBottom: 8,
                      display: 'block',
                      userSelect: 'none',
                    }}
                  >
                    기타 이유:
                  </label>
                  <input
                    id="customReason"
                    type="text"
                    value={customReason}
                    onChange={handleCustomReasonChange}
                    placeholder="직접 입력"
                    style={{
                      width: '100%',
                      padding: 14,
                      fontSize: 20,
                      borderRadius: 8,
                      border: '2px solid #aaa',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                    onBlur={(e) => (e.target.style.borderColor = '#aaa')}
                  />
                </div>
              )}

              {/* 제출 버튼: 텔레포트 전/후 스타일 분기 */}
              <button
                type="submit"
                disabled={!movedTopRight && (!isNicknameChecked || isDuplicateNickname)}
                style={
                  movedTopRight
                    ? {
                        position: 'fixed',
                        top: 8,
                        right: 8,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 4,
                        border: '1px solid #666',
                        backgroundColor: '#ddd',
                        color: '#222',
                        cursor: 'pointer',
                        zIndex: 9999,
                      }
                    : {
                        display: 'block',
                        margin: '0 auto',
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: '700',
                        borderRadius: 4,
                        border: '1px solid #666',
                        backgroundColor: isNicknameChecked ? '#bdbdbd' : '#ccc',
                        color: '#222',
                        cursor: isNicknameChecked ? 'pointer' : 'not-allowed',
                        transition: 'none',
                      }
                }
              >
                제출
              </button>
            </form>
          </>
        )}
      </div>

      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          <div
            className="spinner"
            style={{
              border: '8px solid rgba(255,255,255,0.3)',
              borderTop: '8px solid white',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px',
            }}
          />
          닉네임 중복 확인 중...
        </div>
      )}
    </>
  );
}
