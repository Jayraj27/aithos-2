import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare a set of MBA B-School personal interview questions.

Context for generating the questions:
- The candidate’s background details are as follows:
  Name: {{name}}
  Undergraduate education: {{undergrad}}
  Work experience: {{workex}}
  Specializations or interests: {{interests}}
  Target B-School: {{target_bschool}}

Interview Style:
- This is a real MBA admissions interview.
- Ask a mix of behavioural, motivational, academic, and personality-based questions.
- Avoid technical job interview questions unless relevant to the candidate’s background.
- Keep questions crisp and conversational.
- Avoid unnecessary jargon.
- Ensure a natural mix of:
    1. Profile-based questions
    2. "Why MBA?" motivations
    3. Leadership & teamwork questions
    4. Ethical dilemma questions
    5. Current affairs & business awareness questions
    6. Stress-test / counter questions

Number of questions required: {{amount}}

IMPORTANT FORMATTING RULES:
- Return ONLY the questions.
- No extra commentary.
- Do not include numbering like "1. 2. 3."—just plain text items.
- Return the output strictly as a JSON array of strings, like this:
["Question 1", "Question 2", "Question 3"]

- Do not use "/" or "*" or any broken characters that may confuse a voice assistant.

Thank you!
`,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
