import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";

function Exam() {
  const { examId } = useParams();

  return (
    <PageShell title="Exam">
      <p>Exam ID: {examId}</p>
    </PageShell>
  );
}

export default Exam;