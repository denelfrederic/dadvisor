
import { KnowledgeEntry } from "@/components/knowledge-base/types";

/**
 * Validate that an entry has required fields for embedding generation
 */
export const isValidEntry = (entry: KnowledgeEntry): boolean => {
  // Entry must have both question and answer fields
  if (!entry || !entry.question || !entry.answer) {
    return false;
  }
  
  // Both question and answer must have meaningful content
  if (entry.question.trim() === '' || entry.answer.trim() === '') {
    return false;
  }
  
  // Entry must have an ID for database update
  if (!entry.id) {
    return false;
  }
  
  return true;
};
