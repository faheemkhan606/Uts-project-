import React from 'react';
import App from '../../../src/App';

interface DashboardProps {
  platform?: string;
  edition?: string;
}

export default function Dashboard(props: DashboardProps) {
  // Re-uses and mounts the complete preserved operational React 19 interface
  return <App />;
}
