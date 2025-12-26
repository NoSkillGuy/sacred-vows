import { useState, useMemo } from "react";
import EditableText from "../shared/EditableText";
import EditableDate from "../shared/EditableDate";
import EditableTime from "../shared/EditableTime";
import { useBuilderStore } from "../../../../store/builderStore";

interface Event {
  id?: string;
  label: string;
  date: string;
  time: string;
  venue: string;
}

interface EditableEventCardsProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    events?: {
      events?: Event[];
    };
    wedding?: {
      dates?: string[];
      venue?: {
        name?: string;
      };
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableEventCards - WYSIWYG editable Event Cards
 */
function EditableEventCards({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableEventCardsProps) {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  // Read events directly from store to ensure reactivity
  const events = currentInvitation.data.events || config.events || {};
  // Ensure all events have IDs for stable React keys (use index-based ID if missing)
  const eventList: Event[] = useMemo(
    () =>
      (events.events || []).map((event: Event, index: number) => ({
        ...event,
        id: event.id || `event-${index}`,
      })),
    [events.events]
  );
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const handleAddEvent = () => {
    const wedding = currentInvitation.data.wedding || config.wedding || {};
    const newEvent: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: "New Event",
      date: wedding.dates?.[0] || new Date().toISOString().split("T")[0],
      time: "6:00 PM",
      venue: wedding.venue?.name || "Venue TBD",
    };
    updateNestedData("events", {
      events: [...eventList, newEvent],
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const newEvents = eventList.filter((event) => event.id !== eventId);
    updateNestedData("events", {
      events: newEvents,
    });
  };

  // Helper function to get the current index of an event by ID
  // This ensures paths always point to the correct event even after reordering
  const getEventPath = (eventId: string, field: string): string => {
    const eventIndex = eventList.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      // Fallback to first event if ID not found (shouldn't happen)
      return `events.events.0.${field}`;
    }
    return `events.events.${eventIndex}.${field}`;
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
          <button
            type="button"
            className="ee-event-add-btn"
            onClick={handleAddEvent}
            aria-label="Add new event"
          >
            + Add Event
          </button>
        </div>
      ) : (
        <>
          <div className="ee-event-cards">
            {eventList.map((event) => {
              // event.id is guaranteed to exist from useMemo mapping
              const eventId = event.id!;
              return (
                <div
                  key={eventId}
                  className="ee-event-card"
                  onMouseEnter={() => setHoveredEventId(eventId)}
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  {hoveredEventId === eventId && (
                    <button
                      type="button"
                      className="ee-event-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(eventId);
                      }}
                      title="Delete event"
                      aria-label={`Delete event: ${event.label}`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                  <div className="ee-event-card-inner">
                    <EditableText
                      value={event.label}
                      onUpdate={onUpdate}
                      path={getEventPath(eventId, "label")}
                      className="ee-event-name"
                      tag="h3"
                    />
                    <EditableDate
                      value={event.date}
                      onUpdate={onUpdate}
                      path={getEventPath(eventId, "date")}
                      className="ee-meta-text ee-event-date"
                      placeholder="Click to set date..."
                    />
                    <div className="ee-event-details">
                      <EditableText
                        value={event.venue || "Venue TBD"}
                        onUpdate={onUpdate}
                        path={getEventPath(eventId, "venue")}
                        className="ee-event-venue"
                        tag="p"
                      />
                      <EditableTime
                        value={event.time}
                        onUpdate={onUpdate}
                        path={getEventPath(eventId, "time")}
                        className="ee-event-time"
                        placeholder="Click to set time..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ee-events-actions">
            <button
              type="button"
              className="ee-event-add-btn"
              onClick={handleAddEvent}
              aria-label="Add new event"
            >
              + Add Event
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default EditableEventCards;
