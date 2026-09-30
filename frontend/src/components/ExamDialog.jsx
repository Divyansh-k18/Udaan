import { useEffect, useRef } from "react";
export default function ExamDialog({ children, onClose, ...props }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  function containFocus(event) {
    if (event.key !== "Tab") return;
    const dialog = ref.current;
    const controls = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
  return <dialog ref={ref} {...props} onKeyDown={containFocus} onCancel={event => { event.preventDefault(); closeRef.current(); }}>{children}</dialog>;
}
