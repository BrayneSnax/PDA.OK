/**
 * Gemini API Service
 * Uses direct Gemini REST API (not OpenAI-compatible)
 */

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Clean markdown formatting from AI responses
 * Removes * and # characters that feel dissonant
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '')   // Remove italic markers
    .replace(/^#+\s*/gm, '') // Remove heading markers
    .trim();
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Call Gemini API to generate pattern insight
 */
export async function generateInsight(prompt: string): Promise<string> {
  try {
    // Get API key from environment
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Create timeout promise for React Native compatibility
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
    });

    // Use direct Gemini REST API
    const fetchPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!insight) {
      throw new Error('No insight generated');
    }

    // Clean markdown formatting
    return cleanMarkdown(insight);
  } catch (error) {
    console.error('Error generating insight:', error);
    
    // Return a graceful fallback message
    return 'The system is listening. As patterns emerge, I will offer a quiet observation here.';
  }
}
