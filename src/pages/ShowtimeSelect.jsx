import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

import dayjs from 'dayjs';

export default function ShowtimeSelect() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDateClick, setIsDateClick] = useState(false);

  // 공연관람일시 정보 저장
  const { setViewDate, viewDate } = useUserStore();

  const allowedDates = [
    //dayjs('2025-08-11'),
    dayjs('2025-08-06'),
    dayjs('2025-08-12'),
  ];

  const showtimesByDate = {
    /*
    '2025-08-11': [
      { id: 1, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
    */
   '2025-08-06': [
      { id: 1, time: '16:00', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-12': [
      { id: 2, time: '16:00', actors: ['김인주', '박정민', '이지민'] },
      { id: 3, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
  };

  function shouldDisableDate(date) {
    return !allowedDates.some(function(allowedDate) {
      return allowedDate.isSame(date, 'day');
    });
  }

  function handleDateChange(newValue) {
    setSelectedDate(newValue);
    setIsDateClick(true);
  }

  function handleShowtimeSelect(showtime) {
    console.log('선택된 회차:', showtime);

      if (!selectedDate) {
        alert('날짜를 선택해주세요.');
        return;
      }

      // 선택된 날짜 (dayjs 객체)를 'YYYY-MM-DD' 형식 문자열로 변환
      const dateStr = selectedDate.format('YYYY-MM-DD');

      // 선택된 시간 (ex: '16:00')과 합쳐서 ISO8601 스타일 문자열로 만듦
      // 백엔드에서 Date 타입으로 변환하기 쉽게
      const dateTimeStr = `${dateStr}T${showtime.time}:00`; 
      // 예: '2025-08-12T16:00:00'
      console.log("최종 관람일시 : ", dateTimeStr);
      setViewDate(dateTimeStr); // 상태에 저장

      navigate('/demographic');
    }

  var selectedDateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
  var showtimes = selectedDateStr ? showtimesByDate[selectedDateStr] || [] : [];

  return (
  <div style={styles.container}>

    <div style={styles.header}>
      연극 &lt;키오스크는 어려워&gt;
      <div style={styles.headerSub}>연극실험실 혜화동 1번지</div>
    </div>

    <div style={styles.calendarWrapper}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          sx={{
            width: 700,
            '& .MuiDayCalendar-weekDayLabel': {
              fontSize: '22px',
              fontWeight: '600',
            },
            '& .MuiPickersDay-root': {
              width: 52,
              height: 52,
              fontSize: '20px',
            },
            '& .MuiPickersDay-dayWithMargin': {
              fontSize: '24px',
            },
            '& .Mui-selected': {
              backgroundColor: '#007bff !important',
              color: 'white',
              fontWeight: '700',
            },
            '& .MuiPickersDay-today': {
              borderColor: '#28a745',
              borderWidth: '2px',
            },
            '& .MuiPickersSlideTransition-root': {
            height: 'auto',
          },
          '& .MuiDayCalendar-slideTransition': {
            height: 'auto',
          }
          }}
        />
      </LocalizationProvider>
    </div>

    {isDateClick && (
      <div style={{ marginTop: 30 }}>
        {showtimes.length > 0 ? (
          <>
            <div style={styles.showtimesList}>
              {showtimes.map(function(showtime) {
                return (
                  <div key={showtime.id} style={styles.showtimeItem}>
                    <div style={styles.timeRow}>
                      <div style={styles.time}>{showtime.time}</div>
                      <button
                        style={styles.selectButton}
                        onClick={function() {
                          handleShowtimeSelect(showtime);
                        }}
                      >
                        선택
                      </button>
                    </div>
                    <div style={styles.actors}>
                      {showtime.actors.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={styles.warningText}>해당 날짜는 선택 가능한 회차가 없습니다.</p>
        )}
      </div>
    )}
  </div>
);

}

var styles = {
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerSub: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  container: {
    maxWidth: '820px',
    margin: '0 auto',
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    overflow: 'visible', // ✅ 반드시 visible
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 40,
  },
calendarWrapper: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start', // top 정렬
  flexGrow: 1, // 남는 공간 사용
},
  subtitle: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  showtimesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  showtimeItem: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '14px 20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  actors: {
    fontSize: 16,
    color: '#666',
    whiteSpace: 'normal',
  },
  selectButton: {
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: 6,
    color: 'white',
    padding: '8px 18px',
    fontSize: 16,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  warningText: {
    color: 'red',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
};
