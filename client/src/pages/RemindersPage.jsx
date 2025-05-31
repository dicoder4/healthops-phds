import React, { useState, useEffect } from 'react';
import NavigationHeader from '../pages/NavigationHeader';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [form, setForm] = useState({ text: '', time: '', syncToCalendar: false });

  useEffect(() => {
    fetch('/reminders/data')
      .then(res => res.json())
      .then(data => {
        setReminders(data.reminders || []);
        setGoogleCalendarEvents(data.googleCalendarEvents || []);
        setGoogleCalendarConnected(data.googleCalendarConnected || false);
      });
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    await fetch('/reminders/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    window.location.reload();
  };

  const handleComplete = async (id) => {
    await fetch(`/reminders/complete/${id}`, { method: 'POST' });
    window.location.reload();
  };

  const handleDelete = async (reminderId) => {
    await fetch('/reminders/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reminderId }),
    });
    window.location.reload();
  };

  const formatDateAndTime = (startDateString, endDateString) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString || startDateString);
    return {
      date: `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear()}`,
      time: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} to ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
    };
  };

  return (
    <>
      <NavigationHeader />
      <div className="reminders-page">
        <div className="reminders-bg-overlay"></div>
        <img src="/images/bluerem.jpg" className="reminders-bg" alt="Background" />
        <div className="reminders-container">
          <h1 className="reminders-title">Your Reminders</h1>

          {reminders.length === 0 ? (
            <p className="reminders-empty-message">No reminders yet. Start adding one to stay on track!</p>
          ) : (
            <ul className="reminders-list">
              {reminders.map(reminder => (
                <li key={reminder._id} className="reminders-item">
                  {reminder.completed ? (
                    <span className="reminders-text reminders-completed">
                      {reminder.text} at {reminder.time}
                    </span>
                  ) : (
                    <span className="reminders-text">
                      {reminder.text} at {reminder.time}
                      <button className="reminders-tick-btn" onClick={() => handleComplete(reminder._id)}>✔</button>
                    </span>
                  )}
                  <button className="reminders-delete-btn" onClick={() => handleDelete(reminder._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}

          <form className="reminders-form" onSubmit={handleAddReminder}>
            <h2 className="reminders-form-title">Add a Reminder</h2>
            <label className="reminders-label">Reminder Text:</label>
            <input 
              type="text" 
              className="reminders-input" 
              value={form.text} 
              onChange={e => setForm({ ...form, text: e.target.value })} 
              required 
            />
            <label className="reminders-label">Reminder Time:</label>
            <input 
              type="time" 
              className="reminders-input" 
              value={form.time} 
              onChange={e => setForm({ ...form, time: e.target.value })} 
              required 
            />
            <label className="reminders-checkbox-label">
              <input
                type="checkbox"
                className="reminders-checkbox"
                checked={form.syncToCalendar}
                onChange={e => setForm({ ...form, syncToCalendar: e.target.checked })}
              />
              Sync to Google Calendar
            </label>
            <button type="submit" className="reminders-submit-btn">Add Reminder</button>
          </form>

          {googleCalendarConnected ? (
            <>
              <h2 className="reminders-section-title">Your Google Calendar</h2>
              <div className="reminders-calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={googleCalendarEvents.map(event => ({
                    title: event.summary,
                    start: event.start.dateTime || event.start.date,
                    end: event.end.dateTime || event.end.date,
                  }))}
                />
              </div>

              <h2 className="reminders-section-title">Your Upcoming Google Calendar Events</h2>
              <ul className="reminders-events-list">
                {googleCalendarEvents.map((event, idx) => {
                  const { date, time } = formatDateAndTime(event.start.dateTime || event.start.date, event.end.dateTime || event.end.date);
                  return (
                    <li className="reminders-event-item" key={idx}>
                      <span className="reminders-event-name">{event.summary}</span>
                      <span className="reminders-event-date">{date}</span>
                      <span className="reminders-event-time">{time}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="reminders-calendar-message">
              Your Google Calendar is not connected. 
              <a
  href={`${process.env.REACT_APP_BACKEND_URL}/auth/google`}
  className="reminders-link"
>
  Connect Google Calendar
</a>

            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* Scoped CSS Variables for reminders page only */
        .reminders-page {
          --reminders-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --reminders-secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --reminders-success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --reminders-danger-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          --reminders-neutral-gradient: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          
          --reminders-bg-glass: rgba(255, 255, 255, 0.15);
          --reminders-bg-glass-hover: rgba(255, 255, 255, 0.25);
          --reminders-text-primary: #2d3748;
          --reminders-text-secondary: #4a5568;
          --reminders-text-muted: #718096;
          
          --reminders-shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
          --reminders-shadow-md: 0 4px 6px rgba(0,0,0,0.1);
          --reminders-shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
          --reminders-shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
          --reminders-shadow-glow: 0 0 20px rgba(102, 126, 234, 0.3);
          
          --reminders-border-radius: 12px;
          --reminders-border-radius-lg: 16px;
          --reminders-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Background Elements - Scoped */
        .reminders-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          backdrop-filter: blur(10px);
          z-index: -1;
          pointer-events: none;
        }

        .reminders-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -2;
          filter: blur(3px) brightness(0.7);
          transition: filter 0.3s ease;
        }
        
        /* Main Container - Scoped */
        .reminders-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: var(--reminders-text-primary);
        }

        /* Typography - Scoped */
        .reminders-title, 
        .reminders-form-title, 
        .reminders-section-title {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--reminders-text-primary);
        }

        .reminders-title {
          font-size: 2.2rem;
          margin-bottom: 2rem;
        }

        .reminders-form-title, 
        .reminders-section-title {
          font-size: 1.5rem;
          margin-top: 2rem;
        }

        /* Animations - Scoped */
        @keyframes reminders-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes reminders-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes reminders-scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Reminders List - Scoped */
        .reminders-list {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .reminders-item {
          background: var(--reminders-bg-glass);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1.2rem 1.5rem;
          border-radius: var(--reminders-border-radius);
          box-shadow: var(--reminders-shadow-md);
          transition: var(--reminders-transition);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .reminders-item:hover {
          transform: translateY(-3px);
          box-shadow: var(--reminders-shadow-lg);
          background: var(--reminders-bg-glass-hover);
        }

        .reminders-text {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          color: var(--reminders-text-primary);
        }

        .reminders-completed {
          text-decoration: line-through;
        }

        /* Form Styling - Scoped */
        .reminders-form {
          background: var(--reminders-bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 3rem;
          border-radius: var(--reminders-border-radius-lg);
          box-shadow: var(--reminders-shadow-lg);
          margin: 3rem 0;
          animation: reminders-scaleIn 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .reminders-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--reminders-success-gradient);
        }
        
        .reminders-label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: var(--reminders-text-primary);
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .reminders-input {
          width: 100%;
          padding: 1rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: var(--reminders-border-radius);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: var(--reminders-transition);
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: var(--reminders-text-primary);
          font-family: 'Inter', sans-serif;
        }

        .reminders-input::placeholder {
          color: var(--reminders-text-muted);
        }
        
        .reminders-input:hover {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .reminders-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
          background: rgba(255, 255, 255, 0.2);
        }

        /* Checkbox Styling - Scoped */
        .reminders-checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
          cursor: pointer;
          user-select: none;
        }
        
        .reminders-checkbox {
          appearance: none;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid #667eea;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--reminders-transition);
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .reminders-checkbox:checked {
          background: var(--reminders-primary-gradient);
          border-color: transparent;
        }
        
        .reminders-checkbox:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        /* Button Styling - Scoped */
        .reminders-submit-btn,
        .reminders-delete-btn,
        .reminders-tick-btn {
          background: var(--reminders-primary-gradient);
          color: white;
          padding: 0.7rem 1.5rem;
          border: none;
          border-radius: var(--reminders-border-radius);
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          transition: var(--reminders-transition);
        }
        
        .reminders-submit-btn:hover,
        .reminders-delete-btn:hover,
        .reminders-tick-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--reminders-shadow-md);
        }

        .reminders-submit-btn:active,
        .reminders-delete-btn:active,
        .reminders-tick-btn:active {
          transform: translateY(-1px);
        }
        
        .reminders-submit-btn {
          background: var(--reminders-success-gradient);
          width: 100%;
          padding: 1.25rem;
          font-size: 1.1rem;
          margin-top: 1rem;
        }
        
        .reminders-delete-btn {
          background: var(--reminders-danger-gradient);
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          margin-left: 0.8rem;
        }

        .reminders-tick-btn {
          background: var(--reminders-success-gradient) !important;
          font-size: 1rem !important;
          padding: 0.4rem 0.6rem !important;
          margin-right: 0.8rem !important;
          margin-left: 0.8rem !important;
          border-radius: 6px !important;
          min-width: 32px !important;
          height: 32px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Calendar Container - Scoped */
        .reminders-calendar-container {
          background: var(--reminders-bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem;
          border-radius: var(--reminders-border-radius-lg);
          box-shadow: var(--reminders-shadow-lg);
          margin: 2rem 0;
          animation: reminders-slideUp 0.5s ease-out;
        }

        /* Events List - Scoped */
        .reminders-events-list {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
        }
        
        .reminders-event-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          padding: 1.5rem;
          background: var(--reminders-bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--reminders-border-radius);
          transition: var(--reminders-transition);
          animation: reminders-slideUp 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .reminders-event-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--reminders-secondary-gradient);
        }

        .reminders-event-item:hover {
          transform: translateY(-5px);
          box-shadow: var(--reminders-shadow-lg);
          background: var(--reminders-bg-glass-hover);
        }
        
        .reminders-event-name {
          font-weight: 600;
          color: var(--reminders-text-primary);
          font-size: 1.1rem;
        }
        
        .reminders-event-date,
        .reminders-event-time {
          color: var(--reminders-text-secondary);
          font-weight: 500;
        }

        /* Empty State - Scoped */
        .reminders-empty-message,
        .reminders-calendar-message {
          text-align: center;
          color: var(--reminders-text-muted);
          font-style: italic;
          font-size: 1.1rem;
          margin: 3rem 0;
          padding: 2rem;
          background: var(--reminders-bg-glass);
          backdrop-filter: blur(20px);
          border-radius: var(--reminders-border-radius);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Links - Scoped */
        .reminders-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          position: relative;
          transition: var(--reminders-transition);
        }

        .reminders-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--reminders-primary-gradient);
          transition: width 0.3s ease;
        }

        .reminders-link:hover::after {
          width: 100%;
        }

        .reminders-link:hover {
          color: #764ba2;
        }

        /* FullCalendar Overrides - Scoped to calendar container */
        .reminders-calendar-container .fc {
          font-family: 'Inter', sans-serif;
        }
        
        .reminders-calendar-container .fc-header-toolbar {
          padding: 1rem 0;
        }
        
        .reminders-calendar-container .fc-button {
          background: var(--reminders-primary-gradient) !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 0.5rem 1rem !important;
          font-weight: 600 !important;
          transition: var(--reminders-transition) !important;
        }

        .reminders-calendar-container .fc-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: var(--reminders-shadow-md) !important;
        }
        
        .reminders-calendar-container .fc-event {
          background: var(--reminders-secondary-gradient) !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 0.25rem 0.5rem !important;
          font-weight: 500 !important;
          transition: var(--reminders-transition) !important;
        }
        
        .reminders-calendar-container .fc-event:hover {
          transform: scale(1.05) !important;
          box-shadow: var(--reminders-shadow-md) !important;
        }

        /* Scrollbar Styling - Scoped to reminders page */
        .reminders-page ::-webkit-scrollbar {
          width: 12px;
        }
        
        .reminders-page ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }
        
        .reminders-page ::-webkit-scrollbar-thumb {
          background: var(--reminders-primary-gradient);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .reminders-page ::-webkit-scrollbar-thumb:hover {
          background: var(--reminders-secondary-gradient);
          background-clip: padding-box;
        }
        
        /* Responsive Design - Scoped */
        @media (max-width: 768px) {
          .reminders-container {
            padding: 1rem;
          }

          .reminders-title {
            font-size: 2rem;
          }
          
          .reminders-item {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .reminders-form {
            padding: 2rem;
          }

          .reminders-event-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }

          .reminders-submit-btn,
          .reminders-delete-btn {
            width: 100%;
            margin: 0.5rem 0;
          }

          .reminders-tick-btn {
            width: auto !important;
            margin: 0.5rem !important;
          }
        }
        
        /* Accessibility - Scoped */
        @media (prefers-reduced-motion: reduce) {
          .reminders-page * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus indicators - Scoped */
        .reminders-submit-btn:focus,
        .reminders-delete-btn:focus,
        .reminders-tick-btn:focus,
        .reminders-input:focus,
        .reminders-checkbox:focus,
        .reminders-link:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* High contrast mode support - Scoped */
        @media (prefers-contrast: high) {
          .reminders-page {
            --reminders-bg-glass: rgba(255, 255, 255, 0.9);
            --reminders-bg-glass-hover: rgba(255, 255, 255, 0.95);
            --reminders-text-primary: #000000;
            --reminders-text-secondary: #333333;
          }
        }
      `}</style>
    </>
  );
};

export default Reminders;