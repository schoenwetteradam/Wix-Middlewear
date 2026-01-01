import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../utils/api';
import { format } from 'date-fns';
import './EventsWidget.css';

/**
 * Customer-facing Events Widget
 * This component can be embedded on the Wix site
 */
function EventsWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll({ limit: 10 });
      setEvents(response.data.data);
      setError(null);
    } catch (err) {
      setError('Unable to load events at this time');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="widget-container">
        <div className="widget-loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-container">
        <div className="widget-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h2>Upcoming Salon Events</h2>
        <p>Join us for these exciting events!</p>
      </div>

      <div className="widget-events">
        {events.map((event) => (
          <div key={event.id} className="widget-event">
            <div className="widget-event-date">
              <div className="month">
                {format(new Date(event.scheduleConfig.startDate), 'MMM')}
              </div>
              <div className="day">
                {format(new Date(event.scheduleConfig.startDate), 'dd')}
              </div>
            </div>
            <div className="widget-event-details">
              <h3 className="widget-event-title">{event.title}</h3>
              <p className="widget-event-description">{event.description}</p>
              <div className="widget-event-meta">
                <span className="widget-event-time">
                  {format(new Date(event.scheduleConfig.startDate), 'h:mm a')}
                </span>
                {event.location && (
                  <span className="widget-event-location">{event.location}</span>
                )}
              </div>
              {event.registration?.externalUrl && (
                <a
                  href={event.registration.externalUrl}
                  className="widget-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register Now
                </a>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="widget-no-events">
            <p>No upcoming events at this time. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsWidget;
