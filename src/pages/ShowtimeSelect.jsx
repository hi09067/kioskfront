import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useUserStore from '../store/useUserStore';

export default function ShowtimeSelect() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDateClick, setIsDateClick] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { setViewDate } = useUserStore();

  const allowedDates = [
    dayjs('2025-08-06'),
    dayjs('2025-08-08'),
    dayjs('2025-08-09'),
    dayjs('2025-08-10'),
    dayjs('2025-08-11'),
    dayjs('2025-08-12'),
  ];

  const showtimesByDate = {
    '2025-08-06': [
      { id: 1, time: '20:20', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-08': [
      { id: 1, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-09': [
      { id: 1, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-10': [
      { id: 1, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-11': [
      { id: 1, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
    '2025-08-12': [
      { id: 2, time: '16:00', actors: ['김인주', '박정민', '이지민'] },
      { id: 3, time: '19:30', actors: ['김인주', '박정민', '이지민'] },
    ],
  };

  function shouldDisableDate(date) {
    return !allowedDates.some((allowedDate) => allowedDate.isSame(date, 'day'));
  }

  function handleDateChange(newValue) {
    setSelectedDate(newValue);
    setIsDateClick(true);
  }

  function handleShowtimeSelect(showtime) {
    if (!selectedDate) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const dateStr = selectedDate.format('YYYY-MM-DD');
    const dateTimeStr = `${dateStr}T${showtime.time}:00`;
    setViewDate(dateTimeStr);
    navigate('/demographic');
  }

  async function handleAssignSeats(dateTimeStr) {
    try {
      const res = await axios.get(
        import.meta.env.VITE_BACK_SERVER + `/${dateTimeStr}`
      );
      Swal.fire('성공', '좌석 배정이 완료되었습니다.', 'success');
    } catch (error) {
      console.error('좌석 배정 실패:', error);
      Swal.fire('실패', '좌석 배정 중 오류가 발생했습니다.', 'error');
    } finally {
      setModalOpen(false);
    }
  }

  const selectedDateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
  const showtimes = selectedDateStr ? showtimesByDate[selectedDateStr] || [] : [];

  const allShowtimes = Object.entries(showtimesByDate)
    .flatMap(([date, shows]) =>
      shows.map((show) => ({
        datetime: `${date}T${show.time}:00`,
        label: `${date} ${show.time}`,
      }))
    )
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

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
              '& .MuiDayCalendar-weekDayLabel': { fontSize: '22px', fontWeight: '600' },
              '& .MuiPickersDay-root': { width: 52, height: 52, fontSize: '20px' },
              '& .MuiPickersDay-dayWithMargin': { fontSize: '24px' },
              '& .Mui-selected': {
                backgroundColor: '#007bff !important',
                color: 'white',
                fontWeight: '700',
              },
              '& .MuiPickersDay-today': { borderColor: '#28a745', borderWidth: '2px' },
              '& .MuiPickersSlideTransition-root': { height: 'auto' },
              '& .MuiDayCalendar-slideTransition': { height: 'auto' },
            }}
          />
        </LocalizationProvider>
      </div>

      {isDateClick && (
        <div style={{ marginTop: 30 }}>
          {showtimes.length > 0 ? (
            <div style={styles.showtimesList}>
              {showtimes.map((showtime) => (
                <div key={showtime.id} style={styles.showtimeItem}>
                  <div style={styles.timeRow}>
                    <div style={styles.time}>{showtime.time}</div>
                    <button
                      style={styles.selectButton}
                      onClick={() => handleShowtimeSelect(showtime)}
                    >
                      선택
                    </button>
                  </div>
                  <div style={styles.actors}>{showtime.actors.join(', ')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.warningText}>해당 날짜는 선택 가능한 회차가 없습니다.</p>
          )}
        </div>
      )}

      <button
        style={styles.invisibleButton}
        onClick={() => setModalOpen(true)}
      ></button>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: '16px' }}>어떤 회차의 좌석을 배정할까요?</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {allShowtimes.map((show) => (
                <li key={show.datetime} style={{ marginBottom: '10px' }}>
                  <button
                    style={styles.modalButton}
                    onClick={() => handleAssignSeats(show.datetime)}
                  >
                    {show.label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModalOpen(false)}
              style={{ ...styles.modalButton, backgroundColor: '#ccc' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
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
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
  },
  calendarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexGrow: 1,
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
  invisibleButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    backgroundColor: 'transparent',
    border: 'none',
    zIndex: 1000,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
};
