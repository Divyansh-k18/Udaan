import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";

function Prepare() {
  const { examId } = useParams();

  return (
    <PageShell title="Prepare for Exam">
      <p>Exam ID: {examId}</p>
    </PageShell>
  );
}

export default Prepare;