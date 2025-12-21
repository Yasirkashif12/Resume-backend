export const RESUME_EXTRACTION_PROMPT = `
Analyze the following resume text and extract the information in the following JSON format:
{
  "summary": "A brief 2-3 sentence professional summary",
  "education": [{ "degree": "...", "institution": "...", "year": "..." }],
  "techStack": ["skill1", "skill2", ...],
  "experience": [{ "role": "...", "company": "...", "period": "...", "description": "..." }]
}

Resume text:
{text}
`;
