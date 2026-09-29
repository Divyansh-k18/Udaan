import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";

function ModeSelect() {
  const { examId } = useParams();

  return (
    <PageShell title="Select Exam Mode">
      <p>Exam ID: {examId}</p>
    </PageShell>
  );
}

export default ModeSelect;