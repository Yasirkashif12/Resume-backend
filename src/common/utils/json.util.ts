export function extractJson<T>(text: string): T | null {
  try {
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('JSON Extraction failed:', error);
    return null;
  }
}
