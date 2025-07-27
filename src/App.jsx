import { Route, Routes } from 'react-router-dom';
import DemographicSurvey from './pages/DemographicSurvey';
import SeatQuestionnaire from './pages/SeatQuestionnaire';
import ShowtimeSelect from './pages/ShowtimeSelect';
import StartScreen from './pages/StartScreen';
import TicketReceipt from './pages/TicketReceipt';

function App() {

  return (
      <div className='wrap'>
        <main className='content'>
          <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/showtime" element={<ShowtimeSelect />} />
          <Route path="/demographic" element={<DemographicSurvey />} />
          <Route path="/questions" element={<SeatQuestionnaire />} />
          <Route path="/receipt" element={<TicketReceipt />} />
          {/* 
          */}
          </Routes>
        </main>
      </div>
  )
}

export default App
