import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function setup() {
  // Find or create user
  const user = await db.user.findFirst({ where: { email: "matiashoyl@gmail.com" } });

  if (!user) {
    console.log("User not found. Please sign up first, then run this again.");
    return;
  }

  console.log("Found user:", user.id);

  // Find their latest assessment
  const assessment = await db.assessment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!assessment) {
    console.log("No assessment found. Please start an assessment first.");
    return;
  }

  console.log("Found assessment:", assessment.id, "Status:", assessment.status);

  // Create fake transcript
  const fakeTranscript = [
    { role: "model", text: "Hello! I'm Sarah Mitchell, Senior Technical Recruiter at FinTech Innovations. Thank you for taking the time to speak with me today. I've reviewed your CV and I'm excited to learn more about your experience. Can you start by telling me a bit about yourself and your background in software development?", timestamp: new Date(Date.now() - 300000).toISOString() },
    { role: "user", text: "Hi Sarah, thank you for having me. I'm a software engineer with about 5 years of experience, primarily working with TypeScript, React, and Node.js. I've worked at both startups and larger companies, and I really enjoy building user-facing products.", timestamp: new Date(Date.now() - 270000).toISOString() },
    { role: "model", text: "That sounds great! I see from your CV that you worked at Acme Corp. Can you tell me more about your role there and some of the key projects you worked on?", timestamp: new Date(Date.now() - 240000).toISOString() },
    { role: "user", text: "At Acme Corp I was a senior frontend engineer. I led the redesign of our customer dashboard which improved user engagement by 40%. I also mentored two junior developers and established our component library.", timestamp: new Date(Date.now() - 210000).toISOString() },
    { role: "model", text: "Impressive! The metrics you mentioned are very compelling. How do you typically approach working with cross-functional teams, especially with product managers and designers?", timestamp: new Date(Date.now() - 180000).toISOString() },
    { role: "user", text: "I believe in early and frequent collaboration. I like to be involved in the design phase to provide technical input, and I make sure to communicate trade-offs clearly so we can make informed decisions together.", timestamp: new Date(Date.now() - 150000).toISOString() },
    { role: "model", text: "That aligns well with how we work at FinTech Innovations. One last question - what interests you about this role and our company?", timestamp: new Date(Date.now() - 120000).toISOString() },
    { role: "user", text: "I'm really excited about the payments space and the technical challenges that come with building secure, reliable financial systems. Your company's reputation for engineering excellence is what drew me to apply.", timestamp: new Date(Date.now() - 90000).toISOString() },
    { role: "model", text: "Wonderful! Thank you so much for your time today. It was a pleasure speaking with you. We'll be in touch soon about next steps. Have a great day!", timestamp: new Date(Date.now() - 60000).toISOString() },
    { role: "user", text: "Thank you Sarah, I really enjoyed our conversation. Looking forward to hearing from you!", timestamp: new Date(Date.now() - 30000).toISOString() },
  ];

  // Check if conversation exists
  const existingConv = await db.conversation.findFirst({
    where: { assessmentId: assessment.id, coworkerId: null, type: "voice" }
  });

  if (existingConv) {
    await db.conversation.update({
      where: { id: existingConv.id },
      data: { transcript: fakeTranscript }
    });
    console.log("Updated existing conversation with fake transcript");
  } else {
    await db.conversation.create({
      data: {
        assessmentId: assessment.id,
        coworkerId: null,
        type: "voice",
        transcript: fakeTranscript,
      }
    });
    console.log("Created new conversation with fake transcript");
  }

  // Update assessment status
  await db.assessment.update({
    where: { id: assessment.id },
    data: { status: "ONBOARDING" }
  });
  console.log("Updated assessment status to ONBOARDING");

  console.log("\nDone! Go to: http://localhost:3000/assessment/" + assessment.id + "/congratulations");
}

setup().finally(() => db.$disconnect());
