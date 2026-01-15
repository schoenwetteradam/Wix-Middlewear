import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { format } from 'date-fns';
import './StaffSchedule.css';

function StaffSchedule() {
  const [staffOverview, setStaffOverview] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStaffSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStaffOverview({ date: selectedDate });
      setStaffOverview(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load staff schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadStaffSchedule();
  }, [loadStaffSchedule]);

  if (loading) {
    return <div className="loading">Loading staff schedule...</div>;
  }

  return (
    <div className="staff-schedule">
      <div className="header">
        <h1>Staff Schedule</h1>
      </div>

      <div className="container">
        <nav className="nav">
          <ul className="nav-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/appointments">Appointments</Link></li>
            <li><Link to="/staff-schedule">Staff Schedule</Link></li>
            <li><Link to="/events">Events</Link></li>
          </ul>
        </nav>

        {error && <div className="error">{error}</div>}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Staff Schedule Overview</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>

          <div className="staff-grid">
            {staffOverview.map((staff) => (
              <div key={staff.staffId} className="staff-card">
                <div className="staff-header">
                  <h3>{staff.staffName}</h3>
                  <span className="bookings-count">
                    {staff.bookingsToday} {staff.bookingsToday === 1 ? 'appointment' : 'appointments'}
                  </span>
                </div>
                <div className="staff-appointments">
                  {staff.appointments.length > 0 ? (
                    staff.appointments.map((apt) => (
                      <div key={apt.id} className="schedule-item">
                        <div className="time">
                          {format(new Date(apt.startTime), 'h:mm a')} -
                          {format(new Date(apt.endTime), 'h:mm a')}
                        </div>
                        <div className="details">
                          <div className="service">{apt.serviceName}</div>
                          <div className="client">{apt.contactName || 'Walk-in'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-appointments">No appointments scheduled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffSchedule;
