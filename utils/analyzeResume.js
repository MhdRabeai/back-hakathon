const fs = require("fs");
const pdfParse = require("pdf-parse");
const moment = require("moment");

// دالة لتحليل التاريخ بشكل دقيق
const parseDate = (dateString) => {
  if (!dateString) return moment(); // إذا لم يكن هناك تاريخ

  // تصحيح النصوص غير الضرورية مثل "UniversityOct" أو "DamascusJul"
  const pattern = /([a-zA-Z]+)(\d{4})/;
  const match = dateString.match(pattern);

  if (match) {
    const month = match[1]; // الشهر مثل "Oct"
    const year = match[2]; // السنة مثل "2018"

    // التحقق إذا كان الشهر مكتوباً كاملاً أو مختصراً
    const monthsMap = {
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

    // التحقق إذا كان الشهر في النص مختصر مثل "Oct" أو مكتوب كاملاً مثل "October"
    const monthNumber = monthsMap[month] || month;

    return moment(`${monthNumber} ${year}`, "MM YYYY");
  }

  return moment.invalid(); // في حال لم نجد تطابق
};

// دالة لحساب سنوات الخبرة
const calculateExperience = (startDate, endDate) => {
  if (!startDate.isValid() || !endDate.isValid()) {
    return 0; // إذا كانت التواريخ غير صالحة
  }
  return endDate.diff(startDate, "years", true); // حساب الفرق بين التواريخ بالسنوات
};

// دالة لتحليل الخبرات واستخراج السنوات
const analyzeExperience = (text) => {
  // نبحث عن تواريخ بداية ونهاية الخبرة
  const dateRegex =
    /([a-zA-Z]+\s*\d{4})\s*[-–—]?\s*(present|[a-zA-Z]+\s*\d{4})/gi;
  const matches = [...text.matchAll(dateRegex)];

  let totalExperience = 0;

  matches.forEach((match) => {
    // نقوم بتحليل التواريخ باستخدام دالة parseDate
    const startDate = parseDate(match[1].trim());
    const endDate =
      match[2].trim().toLowerCase() === "present"
        ? moment()
        : parseDate(match[2].trim());

    totalExperience += calculateExperience(startDate, endDate);
  });

  return { totalExperience: Math.round(totalExperience * 100) / 100 }; // تقريب النتيجة
};

// قراءة وتحليل ملف PDF
const processResume = async (filePath) => {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);

    const text = data.text;
    console.log("النص المستخلص من السيرة الذاتية:", text);

    const analysis = analyzeExperience(text);

    console.log("إجمالي سنوات الخبرة:", analysis.totalExperience, "سنوات");
    return analysis;
  } catch (error) {
    console.error("حدث خطأ أثناء معالجة السيرة الذاتية:", error);
    return null;
  }
};

module.exports = { processResume };
