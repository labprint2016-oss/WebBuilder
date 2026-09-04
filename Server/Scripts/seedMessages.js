const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const FormResponse = require("../Models/formResponses");

const readArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
};

const count = Math.min(
  10000,
  Math.max(1, Number.parseInt(readArg("count", "1000"), 10) || 1000)
);
const menuBarId = String(
  readArg("menuBarId", "69db17211be82fe7637ea096")
).trim();
const batchSize = 500;
const seedBatch = new Date().toISOString();

const thaiNames = [
  "สมชาย ใจดี",
  "กานดา รุ่งเรือง",
  "ณัฐวุฒิ พรชัย",
  "พิมพ์ชนก แสงทอง",
  "ธนกร มั่นคง",
  "อรทัย สุขใจ",
];

const createMessage = (index) => {
  const createdAt = new Date(Date.now() - index * 60 * 1000);
  return {
    menuBarId,
    formPresetId: `performance-form-${(index % 5) + 1}`,
    formName: `แบบฟอร์มทดสอบ ${(index % 5) + 1}`,
    answers: [
      {
        id: `name-${index}`,
        label: "ชื่อลูกค้า",
        value: `${thaiNames[index % thaiNames.length]} #${index + 1}`,
      },
      {
        id: `email-${index}`,
        label: "อีเมล",
        value: `performance${index + 1}@example.com`,
      },
      {
        id: `message-${index}`,
        label: "ข้อความ",
        value: `ข้อความสำหรับทดสอบ Performance ลำดับที่ ${index + 1}`,
      },
    ],
    meta: {
      _seed: true,
      seedBatch,
      source: "performance-seed",
      userAgent: "WebBuilder performance test data",
    },
    read: index % 3 === 0,
    starred: index % 10 === 0,
    createdAt,
    updatedAt: createdAt,
  };
};

async function run() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Message seeding is disabled in production");
  }
  if (!process.argv.includes("--confirm")) {
    throw new Error("Add --confirm to create test messages");
  }
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required in Server/.env");
  }
  if (!menuBarId) {
    throw new Error("menuBarId is required");
  }

  await mongoose.connect(process.env.MONGO_URL);
  for (let offset = 0; offset < count; offset += batchSize) {
    const size = Math.min(batchSize, count - offset);
    const rows = Array.from({ length: size }, (_, index) =>
      createMessage(offset + index)
    );
    await FormResponse.insertMany(rows, { ordered: false });
    console.log(`Inserted ${offset + size}/${count} messages`);
  }
  console.log(`Created ${count} test messages for menuBarId=${menuBarId}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
