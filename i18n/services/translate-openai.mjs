import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load env variables in development
if (process.env.NODE_ENV !== 'production') dotenv.config({ path: '.env' });

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI(prompt) {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{
				role: 'user',
				content: prompt,
			},
		],
	});

	return completion;
}

export async function translateWithOpenAI(englishContent, targetLanguages) {
	const systemPrompt = `You are a professional UI/UX localization expert with deep knowledge of:
		- Software interface conventions in different languages
		- When to keep English terms vs. when to translate them
		- Cultural adaptations for each target market
		- Technical terminology standards in each language

		Your expertise includes knowing that:
		- "Dashboard" might stay "Dashboard" in French but become "Panel de control" in Spanish
		- "Download" is universally used in German but becomes "Télécharger" in French
		- Some languages prefer English tech terms while others have established local equivalents

		Always consider the target audience: tech-savvy users might prefer English terms, while general users might need localized versions.

		You are translating for ${process.env.NEXT_PUBLIC_PROJECT_NAME}, ${process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION}. Our brand voice is:
		- Clear, technical, and precise
		- Gaming-focused and user-friendly
		- Professional yet approachable to gamers

		Translation principles for our gaming tool:
		- Prefer gaming terminology that players are familiar with
		- Keep Path of Exile specific terms in English when appropriate
		- Balance between technical accuracy and readability
		- When in doubt, choose the option that sounds more natural to gaming audiences
	`;

	const userPrompt = `Translate the following English UI texts to these languages: ${targetLanguages.join(', ')}.

		CRITICAL RULES:
		1. For EACH target language, independently decide whether English terms should be:
		- Kept as-is (if commonly used in gaming/software in that language)
		- Translated (if a well-established local term exists)
		- Adapted (if the local gaming community uses different terminology)

		2. Consider context and UI conventions:
		- Button texts should be action-oriented
		- Navigation items should be clear and concise
		- Error messages should be helpful, not literal translations
		- Keep consistent terminology throughout
		- Path of Exile specific terms should generally remain in English

		3. Technical considerations:
		- Preserve ALL placeholders exactly: {name}, {count}, {{variable}}
		- Maintain appropriate text length for UI elements
		- Consider text expansion when translating from English

		4. Quality standards:
		- Use tone appropriate for gaming software in each language
		- Apply proper capitalization rules for each language
		- Ensure grammatical gender agreement where applicable

		5. Gaming terminology handling:
		- Keep established gaming terms that are widely used in English
		- "Filter", "Item", "Mod" etc. may stay in English in most languages
		- "Settings", "Options", "Export" - research actual usage in gaming software
		- Consider what terminology popular games use in each language

		6. Gaming context:
		- Our users are Path of Exile 2 players (tech-savvy gamers)
		- They're familiar with English gaming terminology
		- Avoid overly formal language - keep it accessible
		- Examples: "Build" stays "Build" in most languages, "Loot Filter" might become "Filtre de butin" in French

		English source texts:
		${JSON.stringify(englishContent, null, 2)}

		Return a JSON object with language codes as keys. Each language should contain the same structure as the input.
		Think step by step for each language - don't apply blanket rules.
		Return ONLY valid JSON without any explanation or markdown.
	`;

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-2024-11-20',
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
		temperature: 0.1, // Low temperature for consistency
		response_format: { type: 'json_object' },
	});

	const content = completion.choices[0].message.content;
	return content ? JSON.parse(content) : {};
}
