import { useState } from "react";
import EditableText from "../shared/EditableText";
import EditableDate from "../shared/EditableDate";
import EditableTime from "../shared/EditableTime";
import { useBuilderStore } from "../../../../store/builderStore";

/**
 * EditableEventCards - WYSIWYG editable Event Cards
 */
function EditableEventCards({ _translations, _currentLang, config = {}, onUpdate }) {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  // Read events directly from store to ensure reactivity
  const events = currentInvitation.data.events || config.events || {};
  const eventList = events.events || [];
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleAddEvent = () => {
    const wedding = currentInvitation.data.wedding || config.wedding || {};
    const newEvent = {
      label: "New Event",
      date: wedding.dates?.[0] || new Date().toISOString().split("T")[0],
      time: "6:00 PM",
      venue: wedding.venue?.name || "Venue TBD",
    };
    updateNestedData("events", {
      events: [...eventList, newEvent],
    });
  };

  const handleDeleteEvent = (index) => {
    const newEvents = eventList.filter((_, i) => i !== index);
    updateNestedData("events", {
      events: newEvents,
    });
  };

  return (
    <section className="ee-section ee-events-section">
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Events</h2>
        <div className="ee-divider" />
      </div>

      {eventList.length === 0 ? (
        <div className="ee-events-empty">
          <p className="ee-events-empty-message">No events added yet</p>
          <button type="button" className="ee-event-add-btn" onClick={handleAddEvent}>
            + Add Event
          </button>
        </div>
      ) : (
        <>
          <div className="ee-event-cards">
            {eventList.map((event, index) => (
              <div
                key={index}
                className="ee-event-card"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {hoveredIndex === index && (
                  <button
                    type="button"
                    className="ee-event-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(index);
                    }}
                    title="Delete event"
                  >
                    ×
                  </button>
                )}
                <div className="ee-event-card-inner">
                  <EditableText
                    value={event.label}
                    onUpdate={onUpdate}
                    path={`events.events.${index}.label`}
                    className="ee-event-name"
                    tag="h3"
                  />
                  <EditableDate
                    value={event.date}
                    onUpdate={onUpdate}
                    path={`events.events.${index}.date`}
                    className="ee-meta-text ee-event-date"
                    placeholder="Click to set date..."
                  />
                  <div className="ee-event-details">
                    <EditableText
                      value={event.venue || "Venue TBD"}
                      onUpdate={onUpdate}
                      path={`events.events.${index}.venue`}
                      className="ee-event-venue"
                      tag="p"
                    />
                    <EditableTime
                      value={event.time}
                      onUpdate={onUpdate}
                      path={`events.events.${index}.time`}
                      className="ee-event-time"
                      placeholder="Click to set time..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="ee-events-actions">
            <button type="button" className="ee-event-add-btn" onClick={handleAddEvent}>
              + Add Event
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default EditableEventCards;
