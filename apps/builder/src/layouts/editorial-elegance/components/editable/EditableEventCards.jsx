import EditableText from '../shared/EditableText';
import { formatEventDate } from '../../utils/dateFormatter';

/**
 * EditableEventCards - WYSIWYG editable Event Cards
 */
function EditableEventCards({ translations, currentLang, config = {}, onUpdate }) {
  const events = config.events || {};
  const eventList = events.events || [];
  
  if (!eventList.length) return null;
  
  return (
    <section className="ee-section ee-events-section">
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Events</h2>
        <div className="ee-divider" />
      </div>
      
      <div className="ee-event-cards">
        {eventList.map((event, index) => (
          <div key={index} className="ee-event-card">
            <div className="ee-event-card-inner">
              <EditableText
                value={event.label}
                onUpdate={onUpdate}
                path={`events.events.${index}.label`}
                className="ee-event-name"
                tag="h3"
              />
              {formatEventDate(event.date) && (
                <p className="ee-meta-text ee-event-date">
                  {formatEventDate(event.date)}
                </p>
              )}
              <div className="ee-event-details">
                <EditableText
                  value={event.venue || 'Venue TBD'}
                  onUpdate={onUpdate}
                  path={`events.events.${index}.venue`}
                  className="ee-event-venue"
                  tag="p"
                />
                <EditableText
                  value={event.time}
                  onUpdate={onUpdate}
                  path={`events.events.${index}.time`}
                  className="ee-event-time"
                  tag="p"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditableEventCards;

