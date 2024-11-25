const fs = require("fs");
const pdfParse = require("pdf-parse");
const { DateTime } = require("luxon");

const extractTextFromPDF = async (pdfPath) => {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error(
      "An error occurred while extracting text from PDF:",
      error.message
    );
    return "";
  }
};

const parseDate = (dateString) => {
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const regex = /([a-zA-Z]+)\s*(\d{4})|(\d{4})/;
  const match = dateString.match(regex);

  if (match) {
    const month = match[1] ? months[match[1].slice(0, 3)] : "01";
    const year = match[2] || match[3];
    console.log(`Parsed Date: ${year}-${month}-01`);
    return DateTime.fromISO(`${year}-${month}-01`, { zone: "utc" });
  }

  return DateTime.invalid();
};

const calculateExperience = (startDate, endDate) => {
  if (!startDate.isValid || !endDate.isValid) {
    return 0;
  }
  const diff = endDate.diff(startDate, ["years", "months"]).toObject();
  return diff.years + diff.months / 12;
};

const analyzeExperience = (text) => {
  const dateRegex =
    /([a-zA-Z]+\s*\d{4})\s*[-–—]?\s*(present|[a-zA-Z]+\s*\d{4})/gi;
  const matches = [...text.matchAll(dateRegex)];

  let totalExperience = 0;

  matches.forEach((match) => {
    const startDate = parseDate(match[1].trim());
    const endDate =
      match[2].trim().toLowerCase() === "present"
        ? DateTime.now()
        : parseDate(match[2].trim());

    totalExperience += calculateExperience(startDate, endDate);
  });

  return +totalExperience.toFixed(1);
};

const extractSkills = (text) => {
  const skills = [
    "JavaScript",
    "React",
    "Node.js",
    "HTML",
    "CSS",
    "Python",
    "MongoDB",
    "TypeScript",
    "SQL",
    "Docker",
    "Git",
    "Vue.js",
    "Angular",
    "SASS",
    "Java",
    "C#",
    "Swift",
    "PHP",
    "Ruby",
    "Kotlin",
    "GraphQL",
    "Express",
    "AWS",
    "Azure",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Firebase",
    "Kubernetes",
    "Bootstrap",
    "Svelte",
    "Elasticsearch",
    "Jest",
    "GraphQL",
    "Firebase",
    "Tailwind CSS",
    "JQuery",
    "Salesforce",
  ];

  const foundSkills = skills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  const additionalSkills = text.match(/\b\w+\b/g).filter((word) => {
    const techRelatedWords = [
      "API",
      "cloud",
      "server",
      "deployment",
      "container",
      "CI/CD",
    ];
    return (
      techRelatedWords.includes(word.toLowerCase()) &&
      !foundSkills.includes(word)
    );
  });

  return [...foundSkills, ...additionalSkills];
};

const processResume = async (filePath) => {
  try {
    const text = await extractTextFromPDF(filePath);
    const totalExperience = analyzeExperience(text);
    const skills = extractSkills(text);

    return { totalExperience, skills };
  } catch (error) {
    console.error("An error occurred while saving the resume:", error.message);
    return null;
  }
};

module.exports = { processResume };
