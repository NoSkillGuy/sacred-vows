import EditableText from "../shared/EditableText";

interface EditableThingsToDoProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    thingsToDo?: {
      intro?: string;
      activities?: Array<{
        name?: string;
        category?: string;
        description?: string;
        address?: string;
      }>;
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableThingsToDo - List editor for activities, restaurants, landmarks
 */
function EditableThingsToDo({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableThingsToDoProps) {
  const thingsToDo = config.thingsToDo || {};
  const intro = thingsToDo.intro || "While you're in the city...";
  const activities = thingsToDo.activities || [];

  const handleAddActivity = () => {
    const newActivities = [...activities, { name: "", category: "", description: "", address: "" }];
    if (onUpdate) {
      onUpdate("thingsToDo.activities", newActivities);
    }
  };

  const handleUpdateActivity = (index: number, field: string, value: string) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("thingsToDo.activities", updated);
    }
  };

  return (
    <section className="ee-section ee-things-to-do-section">
      <div className="ee-things-to-do-container">
        <h2 className="ee-section-heading">Things to Do</h2>
        <div className="ee-divider" />

        {/* Intro Text */}
        <EditableText
          value={intro}
          onUpdate={onUpdate}
          path="thingsToDo.intro"
          className="ee-things-to-do-intro"
          tag="p"
          multiline={true}
        />

        {/* Activities by Category */}
        <div className="ee-things-to-do-activities">
          {activities.map((activity, index) => (
            <div key={index} className="ee-activity-item">
              <EditableText
                value={activity.name || ""}
                onUpdate={(path, value) => handleUpdateActivity(index, "name", value)}
                className="ee-activity-name"
                tag="h3"
              />
              <EditableText
                value={activity.category || ""}
                onUpdate={(path, value) => handleUpdateActivity(index, "category", value)}
                className="ee-activity-category"
                tag="span"
              />
              <EditableText
                value={activity.description || ""}
                onUpdate={(path, value) => handleUpdateActivity(index, "description", value)}
                className="ee-activity-description"
                tag="p"
                multiline={true}
              />
              <EditableText
                value={activity.address || ""}
                onUpdate={(path, value) => handleUpdateActivity(index, "address", value)}
                className="ee-activity-address"
                tag="p"
              />
            </div>
          ))}
          <button onClick={handleAddActivity} className="ee-add-button" type="button">
            + Add Activity
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditableThingsToDo;
