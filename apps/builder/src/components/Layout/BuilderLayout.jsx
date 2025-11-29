import { useState } from 'react';
import Split from 'react-split';
import Sidebar from './Sidebar';
import PreviewPane from '../Preview/PreviewPane';
import FormPanel from './FormPanel';
import './BuilderLayout.css';

function BuilderLayout() {
  const [activeSection, setActiveSection] = useState('couple');
  const [sizes, setSizes] = useState([30, 70]); // Percentage-based sizes

  return (
    <div className="builder-layout">
      <Split
        sizes={sizes}
        minSize={[250, 400]}
        expandToMin={false}
        gutterSize={4}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        onDragEnd={(sizes) => setSizes(sizes)}
        className="split-container"
      >
        <div className="builder-sidebar-container">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <FormPanel activeSection={activeSection} />
        </div>
        <div className="builder-preview-container">
          <PreviewPane />
        </div>
      </Split>
    </div>
  );
}

export default BuilderLayout;

