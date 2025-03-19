
import { logWithTimestamp } from './utils.ts';

// OpenAI function to generate embeddings
export async function generateEmbeddingWithOpenAI(text: string, apiKey: string) {
  if (!apiKey) {
    throw new Error('Missing OpenAI API key');
  }
  
  const truncatedText = text.slice(0, 8000); // Truncate text to fit within token limits
  logWithTimestamp(`Generating OpenAI embedding for text of ${truncatedText.length} characters`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: truncatedText,
        model: 'text-embedding-3-small' // Using OpenAI's embedding model
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logWithTimestamp(`OpenAI API error (${response.status}): ${error}`);
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    logWithTimestamp(`Embedding generated successfully, dimensions: ${data.data[0].embedding.length}`);
    return data.data[0].embedding;
  } catch (error) {
    logWithTimestamp('Error generating OpenAI embedding:', error);
    throw error;
  }
}
