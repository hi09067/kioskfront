import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import createInstance from "../axios/Interceptor";
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
  '기타'
];

export default function SurveyAll() {
  const { setNickName } = useUserStore();
  const navigate = useNavigate();
  const axios = createInstance();

  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    age: '',
    region: '',
    income: ''
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');

  const handleDemographicChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      setIsNicknameChecked(false); // 닉네임 바뀌면 중복체크 무효화
      setIsDuplicateNickname(true);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNicknameCheck = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACK_SERVER + '/isDuplicateNickname',
        formData.nickname,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
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
    } catch (error) {
      console.error("닉네임 중복 체크 에러", error);
      Swal.fire('오류', '닉네임 중복 체크 중 문제가 발생했습니다.', 'error');
    }finally{
      setIsLoading(false);
    }
  };

  const isAnswered = (name) => formData[name] && formData[name].trim() !== '';
  const allDemographicsAnswered = demographicQuestions.every(q => isAnswered(q.name));

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setReasons(prev =>
      checked ? [...prev, value] : prev.filter(reason => reason !== value)
    );
  };

  const handleCustomReasonChange = (e) => setCustomReason(e.target.value);

  function handleReasonSubmit(e) {
    e.preventDefault();

    if (!isNicknameChecked) {
      Swal.fire('닉네임 중복 체크를 해주세요!', '', 'error');
      return;
    }

    let finalReasons = reasons;
    if (reasons.includes('기타') && customReason.trim()) {
      finalReasons = reasons.filter(r => r !== '기타').concat(customReason.trim());
    }

    if (finalReasons.length === 0) {
      Swal.fire('오류', '참여 이유를 하나 이상 선택해주세요', 'error');
      return;
    }

    Swal.fire({
      title: '정말 제출하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '정말요?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '네',
          cancelButtonText: '아니요',
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            setNickName(formData.nickname);
            navigate('/questions');
          }
        });
      }
    });
  }

  return (
    <>
      {/* 메인 내용 영역 */}
      <div style={{
        padding: 40,
        maxWidth: 560,
        margin: '40px auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 32,
          marginBottom: 32,
          color: '#333'
        }}>
          응답자 정보를 입력해주세요
        </h2>

        {demographicQuestions.map((question, index) => {
          const canShow = demographicQuestions.slice(0, index).every(q => isAnswered(q.name));
          const isOdd = index % 2 === 1;

          return canShow ? (
            <div key={question.name} style={{
              marginBottom: 36,
              display: 'flex',
              flexDirection: isOdd ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <label htmlFor={question.name} style={{
                flexBasis: '40%',
                textAlign: isOdd ? 'right' : 'left',
                fontWeight: '700',
                fontSize: 22,
                color: '#555',
                userSelect: 'none',
                whiteSpace: 'nowrap'
              }}>
                {question.label}
              </label>

              <div style={{
                flexBasis: isOdd ? '50%' : '55%',
                textAlign: isOdd ? 'left' : 'right'
              }}>
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
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => (e.target.style.borderColor = '#007bff')}
                      onBlur={e => (e.target.style.borderColor = '#aaa')}
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
                        cursor: 'pointer'
                      }}>
                      중복 체크
                    </button>
                  </div>
                )}

                {question.type === 'radio' && question.options.map(option => (
                  <label key={option} style={{
                    marginRight: 16,
                    cursor: 'pointer',
                    fontSize: 20,
                    userSelect: 'none'
                  }}>
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
                        height: 24
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
                      textAlignLast: 'center'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#007bff')}
                    onBlur={e => (e.target.style.borderColor = '#aaa')}
                  >
                    <option value="">선택</option>
                    {question.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : null;
        })}

        {allDemographicsAnswered && (
          <>
            <h2 style={{
              marginTop: 48,
              textAlign: 'center',
              color: '#333',
              fontSize: 28,
              fontWeight: '700',
              marginBottom: 20
            }}>
              관람 또는 참여 이유가 무엇입니까?
            </h2>

            <form onSubmit={handleReasonSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {reasonOptions.map(reason => (
                  <label key={reason} style={{
                    cursor: 'pointer',
                    fontSize: 22,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
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
                  <label htmlFor="customReason" style={{
                    fontWeight: '700',
                    fontSize: 20,
                    marginBottom: 8,
                    display: 'block',
                    userSelect: 'none'
                  }}>기타 이유:</label>
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
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#007bff')}
                    onBlur={e => (e.target.style.borderColor = '#aaa')}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!isNicknameChecked || isDuplicateNickname}
                style={{
                  display: 'block',
                  margin: '0 auto',
                  padding: '16px 44px',
                  fontSize: 22,
                  fontWeight: '700',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isNicknameChecked ? '#007bff' : '#ccc',
                  color: 'white',
                  cursor: isNicknameChecked ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.3s'
                }}
              >
                제출
              </button>
            </form>
          </>
        )}
      </div>

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          <div className="spinner" style={{
            border: '8px solid rgba(255,255,255,0.3)',
            borderTop: '8px solid white',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
          }} />
          닉네임 중복 확인 중...
        </div>
      )}

    </>
  );

}
