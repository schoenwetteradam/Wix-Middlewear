import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI, staffAPI } from '../utils/api';
import { format } from 'date-fns';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [filterStaff, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, staffRes] = await Promise.all([
        appointmentsAPI.getAll({
          staffMemberId: filterStaff || undefined,
          status: filterStatus || undefined,
        }),
        staffAPI.getAll(),
      ]);

      setAppointments(appointmentsRes.data.data);
      setStaff(staffRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.cancel(appointmentId);
      loadData();
    } catch (err) {
      alert('Failed to cancel appointment');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointments">
      <div className="header">
        <h1>Appointments</h1>
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
            <h2 className="card-title">All Appointments</h2>
            <div className="filters">
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="filter-select"
              >
                <option value="">All Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Service</th>
                  <th>Staff Member</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div>{format(new Date(apt.startTime), 'MMM dd, yyyy')}</div>
                      <div className="time-small">
                        {format(new Date(apt.startTime), 'h:mm a')}
                      </div>
                    </td>
                    <td>{apt.serviceName || 'N/A'}</td>
                    <td>{apt.staffMemberName || 'N/A'}</td>
                    <td>{apt.contactName || 'Walk-in'}</td>
                    <td>
                      <span className={`status-badge status-${apt.status?.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="btn btn-danger btn-sm"
                        disabled={apt.status === 'CANCELLED'}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <p className="no-data">No appointments found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
