import { useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';
import PreviewPane from '../Preview/PreviewPane';
import './BuilderLayout.css';

function BuilderLayout() {
  const [editMode, setEditMode] = useState(true);
  const [deviceMode, setDeviceMode] = useState('desktop');

  return (
    <div className="builder-layout">
      <Toolbar
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
      />
      <div className="builder-main">
        <PreviewPane 
          editMode={editMode}
          deviceMode={deviceMode}
        />
      </div>
    </div>
  );
}

export default BuilderLayout;
