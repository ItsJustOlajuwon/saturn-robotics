export const ONBOARDING_QUESTIONS = [
  {
    id: "experience",
    question: "How much experience do you have with electronics?",
    options: [
      { label: "Total beginner \u{1F331}", value: "beginner" },
      { label: "I've done a few projects", value: "some" },
      { label: "Comfortable with Arduino", value: "arduino" },
      { label: "Pretty experienced", value: "advanced" },
    ],
  },
  {
    id: "goal",
    question: "What do you want to build?",
    options: [
      { label: "Robots & automation \u{1F916}", value: "robots" },
      { label: "Smart home / IoT \u{1F3E0}", value: "iot" },
      { label: "Drones & RC vehicles \u{1F681}", value: "drones" },
      { label: "Not sure yet, just exploring", value: "explore" },
    ],
  },
  {
    id: "board",
    question: "Do you already own a board?",
    options: [
      { label: "Arduino Uno / Nano", value: "arduino" },
      { label: "ESP32", value: "esp32" },
      { label: "Teensy", value: "teensy" },
      { label: "I don't have one yet", value: "none" },
    ],
  },
  {
    id: "time",
    question: "How much time can you dedicate per week?",
    options: [
      { label: "Just 15\u201330 mins", value: "casual" },
      { label: "About an hour", value: "regular" },
      { label: "A few hours", value: "dedicated" },
      { label: "As much as it takes \u{1F525}", value: "intense" },
    ],
  },
];
