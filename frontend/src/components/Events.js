import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { format } from 'date-fns';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      loadEvents();
    } catch (err) {
      alert('Failed to delete event');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="events">
      <div className="header">
        <h1>Salon Events</h1>
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
            <h2 className="card-title">Upcoming Events</h2>
          </div>

          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <span className="event-date">
                    {format(new Date(event.scheduleConfig.startDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="event-card-body">
                  <p className="event-description">{event.description}</p>
                  {event.location && (
                    <p className="event-location">
                      <strong>Location:</strong> {event.location}
                    </p>
                  )}
                  <p className="event-time">
                    <strong>Time:</strong>{' '}
                    {format(new Date(event.scheduleConfig.startDate), 'h:mm a')}
                    {event.scheduleConfig.endDate && (
                      <> - {format(new Date(event.scheduleConfig.endDate), 'h:mm a')}</>
                    )}
                  </p>
                </div>
                <div className="event-card-footer">
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <p className="no-data">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;
