import { useEffect, useRef, useState } from "react";

const SHORTCUTS = [
  ["Alt + N", "Next question"],
  ["Alt + P", "Previous question"],
  ["Alt + R", "Repeat question"],
  ["Alt + T", "Time left"],
  ["Alt + M", "Mark question"],
  ["Alt + H", "Open help"],
  ["Alt + V", "Start voice listening"],
  ["Alt + L", "Change language"],
  ["Alt + S", "Submit"],
  ["Alt + G", "Go to question"],
  ["Alt + C", "Section status"],
  ["Alt + B", "Bookmark"],
  ["Alt + E", "Explain again"],
  ["Alt + 1", "Select option A"],
  ["Alt + 2", "Select option B"],
  ["Alt + 3", "Select option C"],
  ["Alt + 4", "Select option D"],
  ["Escape", "Stop speech or close dialog"],
];

const VOICE_COMMANDS = [
  "Next",
  "Previous",
  "Repeat",
  "Read options",
  "Option A",
  "Option B",
  "Option C",
  "Option D",
  "Clear",
  "Mark",
  "Time left",
  "Go to question 5",
  "Section status",
  "Submit",
  "Yes",
  "No",
  "Help",
  "Stop",
  "Start exam",
  "Practice",
  "Progress",
  "Settings",
  "Bookmark",
  "Explain again",
];

function isTypingElement(element) {
  if (!element) {
    return false;
  }

  const tagName = element.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

function HelpDialog() {
  const [open, setOpen] = useState(false);

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  function openDialog() {
    previousFocusRef.current = document.activeElement;
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  useEffect(() => {
    const listener = () => openDialog();
    window.addEventListener("udaan:open-help", listener);
    return () => window.removeEventListener("udaan:open-help", listener);
  }, []);
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  /*
    Alt+H opens Help.

    We use event.code so keyboard layout changes
    do not break the shortcut.
  */
  useEffect(() => {
    function handleGlobalKeyDown(event) {
      if (
        event.altKey &&
        event.code === "KeyH" &&
        !isTypingElement(event.target)
      ) {
        event.preventDefault();

        if (!open) {
          openDialog();
        }

        return;
      }

      if (event.code === "Escape" && open) {
        event.preventDefault();
        closeDialog();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleGlobalKeyDown
      );
    };
  }, [open]);

  /*
    Focus the Close button whenever the dialog opens.
  */
  useEffect(() => {
    if (!open) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open]);

  /*
    After closing, put focus back where it was
    before Help opened.
  */
  useEffect(() => {
    if (open) {
      return;
    }

    if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === "function"
    ) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  /*
    Trap Tab and Shift+Tab inside the dialog.
  */
  useEffect(() => {
    if (!open) {
      return;
    }

    function trapFocus(event) {
      if (event.code !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = dialog.querySelectorAll(
        [
          'button:not([disabled])',
          'a[href]',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(",")
      );

      const focusable = Array.from(focusableElements);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);

    return () => {
      window.removeEventListener("keydown", trapFocus);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="help-open-button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Help
        <span className="shortcut-hint"> Alt+H</span>
      </button>

      {open && (
        <div
          className="help-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <dialog
            ref={dialogRef}
            onCancel={(event) => { event.preventDefault(); closeDialog(); }}
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            aria-describedby="help-dialog-description"
            tabIndex="-1"
          >
            <div className="help-dialog-header">
              <div>
                <h2 id="help-dialog-title">
                  Udaan Help
                </h2>

                <p id="help-dialog-description">
                  Keyboard shortcuts and voice commands
                  available in Udaan.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="help-close-button"
                onClick={closeDialog}
                aria-label="Close help"
              >
                Close
              </button>
            </div>

            <section aria-labelledby="keyboard-help-title">
              <h3 id="keyboard-help-title">
                Keyboard shortcuts
              </h3>

              <div className="shortcut-table-wrapper">
                <table className="shortcut-table">
                  <caption className="sr-only">
                    Udaan keyboard shortcuts
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Shortcut</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {SHORTCUTS.map(([shortcut, action]) => (
                      <tr key={shortcut}>
                        <td>
                          <kbd>{shortcut}</kbd>
                        </td>

                        <td>{action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="voice-command-help"
              aria-labelledby="voice-help-title"
            >
              <h3 id="voice-help-title">
                Voice commands
              </h3>

              <p>
                English command words work even when
                another Udaan language is selected.
              </p>

              <ul className="voice-command-list">
                {VOICE_COMMANDS.map((command) => (
                  <li key={command}>
                    <code>{command}</code>
                  </li>
                ))}
              </ul>
            </section>

            <p className="help-footer">
              Press <kbd>Escape</kbd> at any time to
              close this Help dialog.
            </p>
          </dialog>
        </div>
      )}
    </>
  );
}

export default HelpDialog;