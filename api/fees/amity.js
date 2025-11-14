// api/fees/amity.js
export default function handler(req, res) {
  const data = {
    university: "Amity University (Demo)",
    year: 2021,
    courses: [
      { name: "B.Tech", fee_min: 100000, fee_max: 280000, duration: "4 years" },
      { name: "MBA", fee_min: 120000, fee_max: 220000, duration: "2 years" },
      { name: "LLB", fee_min: 60000, fee_max: 160000, duration: "3 years" }
    ]
  };

  res.status(200).json(data);
}
