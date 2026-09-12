import { useEffect, useRef } from 'react';

type Guard = () => boolean;
const guards = new Map<number, Guard>();
let nextGuardId = 1;
const warning = 'Are you sure you want to leave this page? Your current edits are unsaved.';

export function confirmUnsavedChanges() {
  for (const guard of guards.values()) {
    if (!guard()) return false;
  }
  return true;
}

export function useUnsavedChanges(dirty: boolean) {
  const id = useRef(nextGuardId++).current;

  useEffect(() => {
    if (dirty) {
      guards.set(id, () => window.confirm(warning));
    } else {
      guards.delete(id);
    }
    return () => { guards.delete(id); };
  }, [dirty, id]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warning;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return () => !dirty || window.confirm(warning);
}
