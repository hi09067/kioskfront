import { createRoot } from 'react-dom/client';
//import './index.css'
import App from './App.jsx';
//라우터 사용을 위한 import
//import {BrowserRouter} from "react-router-dom";
//컴포넌트 외부에서 컴포넌트 전환을 위해 Histroy 사용으로 변경
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { customHistory } from './common/history.js';

createRoot(document.getElementById('root')).render(
  <HistoryRouter history={customHistory}>
    <App />
  </HistoryRouter>
)
