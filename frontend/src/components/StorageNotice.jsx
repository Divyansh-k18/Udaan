import { useEffect, useState } from "react";
import { storage } from "../services/storage";
export default function StorageNotice() {
  const [temporary, setTemporary] = useState(storage.isTemporary);
  useEffect(() => {
    const listener = () => setTemporary(true);
    window.addEventListener("udaan:storage-unavailable", listener);
    return () => window.removeEventListener("udaan:storage-unavailable", listener);
  }, []);
  return temporary ? <p role="status" className="demo-notice">Browser storage is unavailable. You can continue, but this visit’s settings and answers may be lost when you refresh or close the page.</p> : null;
}
