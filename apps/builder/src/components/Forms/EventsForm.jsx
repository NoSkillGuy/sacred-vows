import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';

function EventsForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const events = currentInvitation.data.events || {};
  const day1Events = events.day1?.events || [];
  const day2Events = events.day2?.events || [];
  const day1Date = events.day1?.date || '';
  const day2Date = events.day2?.date || '';

  const updateEvents = (day, newEvents, newDate) => {
    updateNestedData('events', {
      [day]: {
        date: newDate,
        events: newEvents,
      },
    });
  };

  const addEvent = (day) => {
    const currentEvents = day === 'day1' ? day1Events : day2Events;
    const newEvent = {
      id: `event-${Date.now()}`,
      label: 'New Event',
      tag: 'Event description',
      time: '12:00 PM',
      date: day === 'day1' ? currentInvitation.data.wedding?.dates?.[0] : currentInvitation.data.wedding?.dates?.[1],
      emoji: '🎉',
    };
    updateEvents(day, [...currentEvents, newEvent], day === 'day1' ? day1Date : day2Date);
  };

  const updateEvent = (day, index, field, value) => {
    const currentEvents = day === 'day1' ? [...day1Events] : [...day2Events];
    currentEvents[index] = { ...currentEvents[index], [field]: value };
    updateEvents(day, currentEvents, day === 'day1' ? day1Date : day2Date);
  };

  const removeEvent = (day, index) => {
    const currentEvents = day === 'day1' ? [...day1Events] : [...day2Events];
    currentEvents.splice(index, 1);
    updateEvents(day, currentEvents, day === 'day1' ? day1Date : day2Date);
  };

  const updateDate = (day, newDate) => {
    const currentEvents = day === 'day1' ? day1Events : day2Events;
    updateEvents(day, currentEvents, newDate);
  };

  const renderEventList = (day, events, date) => (
    <div className="form-subsection">
      <div className="form-group">
        <label className="form-label">Day Label</label>
        <input
          type="text"
          className="form-input"
          value={date}
          onChange={(e) => updateDate(day, e.target.value)}
          placeholder="Thursday · 22 January 2026"
        />
      </div>

      {events.map((event, index) => (
        <div key={event.id || index} className="event-item-form">
          <div className="form-group">
            <label className="form-label">Event Name</label>
            <input
              type="text"
              className="form-input"
              value={event.label || ''}
              onChange={(e) => updateEvent(day, index, 'label', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description/Tag</label>
            <input
              type="text"
              className="form-input"
              value={event.tag || ''}
              onChange={(e) => updateEvent(day, index, 'tag', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="text"
              className="form-input"
              value={event.time || ''}
              onChange={(e) => updateEvent(day, index, 'time', e.target.value)}
              placeholder="3:00 PM"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emoji (or leave empty for image)</label>
            <input
              type="text"
              className="form-input"
              value={event.emoji || ''}
              onChange={(e) => updateEvent(day, index, 'emoji', e.target.value)}
              placeholder="🪔"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (if no emoji)</label>
            <input
              type="text"
              className="form-input"
              value={event.image || ''}
              onChange={(e) => updateEvent(day, index, 'image', e.target.value)}
              placeholder="/assets/photos/icons/3.jpg"
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => removeEvent(day, index)}
            style={{ marginBottom: '16px' }}
          >
            Remove Event
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => addEvent(day)}
      >
        Add Event
      </button>
    </div>
  );

  return (
    <div className="form-section">
      <h3 className="form-section-title">Events</h3>
      
      <div className="form-subsection">
        <h4 className="form-subsection-title">Day 1</h4>
        {renderEventList('day1', day1Events, day1Date)}
      </div>

      <div className="form-subsection" style={{ marginTop: '32px' }}>
        <h4 className="form-subsection-title">Day 2</h4>
        {renderEventList('day2', day2Events, day2Date)}
      </div>
    </div>
  );
}

export default EventsForm;

