import { useEffect } from 'react';
import { EditorShell } from './components/editor/EditorShell';

export default function App() {
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', '/editor');
    }
  }, []);

  return <EditorShell />;
}
