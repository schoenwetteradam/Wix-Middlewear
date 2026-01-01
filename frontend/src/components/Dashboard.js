import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { format } from 'date-fns';
import './Dashboard.css';

function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisRes, upcomingRes] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getUpcoming({ limit: 5 }),
      ]);

      setKpis(kpisRes.data.data);
      setUpcoming(upcomingRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Salon Dashboard</h1>
      </div>

      <div className="container">
        {/* Navigation */}
        <nav className="nav">
          <ul className="nav-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/appointments">Appointments</Link></li>
            <li><Link to="/staff-schedule">Staff Schedule</Link></li>
            <li><Link to="/events">Events</Link></li>
          </ul>
        </nav>

        {/* KPI Cards */}
        <div className="grid grid-4">
          <div className="kpi-card">
            <div className="kpi-value">{kpis?.totalAppointments || 0}</div>
            <div className="kpi-label">Total Appointments</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{kpis?.completedAppointments || 0}</div>
            <div className="kpi-label">Completed</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{kpis?.pendingAppointments || 0}</div>
            <div className="kpi-label">Pending</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">${kpis?.totalRevenue || 0}</div>
            <div className="kpi-label">Revenue</div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Appointments Today</h2>
            <Link to="/appointments" className="btn btn-primary">View All</Link>
          </div>
          <div className="appointments-list">
            {upcoming?.appointments?.length > 0 ? (
              upcoming.appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-time">
                    {format(new Date(appointment.startTime), 'h:mm a')}
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-service">{appointment.serviceName}</div>
                    <div className="appointment-staff">{appointment.staffMemberName}</div>
                  </div>
                  <div className={`appointment-status status-${appointment.status?.toLowerCase()}`}>
                    {appointment.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No upcoming appointments today</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Events</h2>
            <Link to="/events" className="btn btn-primary">View All</Link>
          </div>
          <div className="events-list">
            {upcoming?.events?.length > 0 ? (
              upcoming.events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    {format(new Date(event.scheduleConfig.startDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-description">{event.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        {kpis?.staffPerformance && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Staff Performance</h2>
            </div>
            <div className="staff-performance">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Total Appointments</th>
                    <th>Completed</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.staffPerformance.map((staff) => (
                    <tr key={staff.staffId}>
                      <td>{staff.staffName}</td>
                      <td>{staff.totalAppointments}</td>
                      <td>{staff.completedAppointments}</td>
                      <td>${staff.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
