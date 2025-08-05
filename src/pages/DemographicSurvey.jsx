// SurveyAll.jsx
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
  const [isLoading, setIsLoading] = useState(false);

  const handleDemographicChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      setIsNicknameChecked(false);
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
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const isDuplicate = response.data;
      if (isDuplicate) {
        Swal.fire('중복된 닉네임입니다!', '다른 닉네임을 입력해주세요.', 'error');
      } else {
        Swal.fire('사용 가능한 닉네임입니다.', '', 'success');
        setIsNicknameChecked(true);
      }
    } catch (error) {
      console.error("닉네임 중복 체크 에러", error);
      Swal.fire('오류', '닉네임 중복 체크 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 기존 폼 생략... */}

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          닉네임 중복 확인 중...
        </div>
      )}
    </div>
  );
}
