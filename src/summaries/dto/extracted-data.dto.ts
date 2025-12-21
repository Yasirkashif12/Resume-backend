export class ExtractedDataDto {
  summary: string;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  techStack: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    description: string;
  }[];
}
