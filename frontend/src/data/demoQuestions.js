// Original English demo content, not official papers or a full syllabus.
const school = ["class-9-demo", "class-10-demo", "class-11-demo", "class-12-demo"];
const records = [
  ["school-9-1", [school[0]], "Mathematics", "Linear equations", "Solve: 3x + 5 = 20.", ["3", "5", "7", "15"], 1, "Subtract 5, then divide 15 by 3. Therefore x = 5."],
  ["school-9-2", [school[0]], "Mathematics", "Linear equations", "If 2x = 14, what is x + 1?", ["6", "7", "8", "15"], 2, "x is 7, so x + 1 is 8."],
  ["school-10-1", [school[1]], "Mathematics", "Quadratics", "What are the roots of x squared minus 5x plus 6 equals zero?", ["1 and 6", "2 and 3", "-2 and -3", "0 and 5"], 1, "Factor as (x - 2)(x - 3), giving roots 2 and 3."],
  ["school-10-2", [school[1]], "Mathematics", "Quadratics", "What is the discriminant of x squared minus 4x plus 4 equals zero?", ["0", "4", "8", "16"], 0, "The discriminant is b squared minus 4ac: 16 minus 16 equals zero."],
  ["school-11-1", [school[2]], "Mathematics", "Sequences", "An arithmetic sequence begins 3, 7, 11. What is its tenth term?", ["35", "39", "40", "43"], 1, "The tenth term is 3 + 9 times 4 = 39."],
  ["school-11-2", [school[2]], "Mathematics", "Sequences", "A geometric sequence begins 2, 6, 18. What is the fourth term?", ["24", "36", "54", "60"], 2, "Each term is multiplied by 3, so the fourth term is 54."],
  ["calculus-1", [school[3], "jee-demo"], "Mathematics", "Differentiation", "What is the derivative of x squared with respect to x?", ["x", "2x", "2", "x cubed"], 1, "The power rule gives 2 times x to the power 1, or 2x."],
  ["calculus-2", [school[3], "jee-demo"], "Mathematics", "Differentiation", "What is the derivative of 3x + 7?", ["0", "3", "7", "10"], 1, "The derivative of 3x is 3 and that of the constant 7 is zero."],
  ["physics-1", ["jee-demo", "neet-demo"], "Physics", "Motion", "A body starts from rest with constant acceleration 2 metres per second squared. What is its speed after 5 seconds?", ["2 m/s", "5 m/s", "10 m/s", "25 m/s"], 2, "Use v = u + at: 0 + 2 times 5 = 10 metres per second."],
  ["physics-2", ["jee-demo", "neet-demo"], "Physics", "Motion", "A body travels 30 metres in 6 seconds at constant speed. What is its speed?", ["5 m/s", "6 m/s", "24 m/s", "180 m/s"], 0, "Speed is distance divided by time: 30 / 6 = 5 metres per second."],
  ["chemistry-1", ["jee-demo", "neet-demo"], "Chemistry", "Atomic structure", "Which particle carries a negative electric charge?", ["Proton", "Neutron", "Electron", "Nucleus"], 2, "Electrons carry negative charge; protons carry positive charge."],
  ["chemistry-2", ["jee-demo", "neet-demo"], "Chemistry", "Atomic structure", "An atom has 6 protons. What is its atomic number?", ["3", "6", "12", "18"], 1, "Atomic number equals the number of protons, so it is 6."],
  ["biology-1", ["neet-demo"], "Biology", "Cells", "Which organelle is the main site of aerobic ATP production in a eukaryotic cell?", ["Ribosome", "Mitochondrion", "Golgi apparatus", "Lysosome"], 1, "Mitochondria carry out key stages of aerobic respiration and produce ATP."],
  ["biology-2", ["neet-demo"], "Biology", "Cells", "Which structure controls the movement of substances into and out of a cell?", ["Cell membrane", "Nucleolus", "Chromosome", "Ribosome"], 0, "The cell membrane is selectively permeable and regulates exchange with the surroundings."],
];
export const demoQuestions = records.map(([id, exams, subject, topic, text, options, answer, explanation]) => ({ id, exams, subject, topic, text: { "en-IN": text }, spoken: { "en-IN": text }, options: { "en-IN": options }, answer, explanation: { "en-IN": explanation }, difficulty: "demo", reviewedBy: null }));
