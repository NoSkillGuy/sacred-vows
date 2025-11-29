import { useState } from 'react';
import BuilderLayout from './components/Layout/BuilderLayout';
import { useBuilderStore } from './store/builderStore';

function App() {
  const { currentInvitation } = useBuilderStore();

  return (
    <div className="app">
      <BuilderLayout />
    </div>
  );
}

export default App;

