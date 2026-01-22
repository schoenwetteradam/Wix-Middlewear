import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StaffSchedule from './components/StaffSchedule';
import Appointments from './components/Appointments';
import Events from './components/Events';
import EventsWidget from './components/EventsWidget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Staff Dashboard Pages */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff-schedule" element={<StaffSchedule />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/events" element={<Events />} />

          {/* Customer-facing Widget */}
          <Route path="/widget/events" element={<EventsWidget />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
