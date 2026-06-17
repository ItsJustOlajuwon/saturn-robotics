export function getRecommendations(answers) {
  const recommended = new Set();
  const { experience, goal, board } = answers;

  if (experience === "beginner" || experience === "some") recommended.add("arduino");
  if (experience === "arduino" || experience === "advanced") {
    recommended.add("esp32");
    recommended.add("motors");
  }
  if (experience === "advanced") recommended.add("teensy");
  if (goal === "iot") recommended.add("esp32");
  if (goal === "robots" || goal === "drones") { recommended.add("motors"); recommended.add("arduino"); }
  if (board === "arduino") recommended.add("arduino");
  if (board === "esp32") recommended.add("esp32");
  if (board === "teensy") recommended.add("teensy");
  if (board === "none" || experience === "beginner") recommended.add("arduino");

  return [...recommended];
}
