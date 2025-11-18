
// @ts-ignore
import nlp from 'compromise';

export const generateSmartTags = (htmlContent: string): string[] => {
    // 1. Strip HTML to get raw text
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const text = doc.body.textContent || "";

    if (text.length < 20) return []; // Too short to analyze

    const docNlp = nlp(text);

    // 2. Extract relevant entities
    // We look for #Topic (keywords), #Place (locations), #Person (names), #Organization
    const topics = docNlp.topics().out('array');
    const places = docNlp.places().out('array');
    const people = docNlp.people().out('array');

    // 3. Combine and normalize
    const rawTags = [...topics, ...places, ...people];

    // 4. Clean up tags
    const cleanedTags = rawTags
        .map((tag: string) => tag.trim())
        // Remove very short tags or common stop words that might slip through
        .filter((tag: string) => tag.length > 2)
        // Capitalize first letter of each word for consistency
        .map((tag: string) => 
            tag.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
        );

    // 5. Deduplicate
    return Array.from(new Set(cleanedTags));
};
