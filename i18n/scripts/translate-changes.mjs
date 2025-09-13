import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { translateWithOpenAI } from '../services/translate-openai.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const TRANSLATIONS_DIR = path.join(ROOT_DIR, 'translations');
const CACHE_DIR = path.join(ROOT_DIR, '.translation-cache');

const TARGET_LANGUAGES = ['de', 'es', 'fr', 'nl', 'it', 'ru', 'tr'];

const CONFIG = {
	maxKeysPerChunk: 10,
	maxRetries: 3,
	retryDelay: 2000,
	languageBatchSize: 3,
	apiCallDelay: 1000,
};

const deepDiff = (current, previous, path = []) => {
	const changes = { added: {}, modified: {}, removed: [] };

	Object.entries(current).forEach(([key, value]) => {
		const currentPath = [...path, key];
		const pathStr = currentPath.join('.');

		if (!(key in previous)) {
			changes.added[pathStr] = value;
		} else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			if (typeof previous[key] === 'object' && previous[key] !== null && !Array.isArray(previous[key])) {
				const nestedChanges = deepDiff(value, previous[key], currentPath);
				Object.assign(changes.added, nestedChanges.added);
				Object.assign(changes.modified, nestedChanges.modified);
				changes.removed.push(...nestedChanges.removed);
			} else {
				changes.modified[pathStr] = value;
			}
		} else if (JSON.stringify(value) !== JSON.stringify(previous[key])) {
			changes.modified[pathStr] = value;
		}
	});

	Object.keys(previous)
		.filter((key) => !(key in current))
		.forEach((key) => {
			const currentPath = [...path, key];
			if (typeof previous[key] === 'object' && previous[key] !== null && !Array.isArray(previous[key])) {
				const getAllPaths = (obj, basePath) =>
					Object.entries(obj).flatMap(([k, v]) => {
						const fullPath = [...basePath, k];
						const paths = [fullPath.join('.')];

						if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
							paths.push(...getAllPaths(v, fullPath));
						}
						return paths;
					});

				changes.removed.push(...getAllPaths(previous[key], currentPath));
			} else {
				changes.removed.push(currentPath.join('.'));
			}
		});

	return changes;
};

// Merge source files from translations-src directory
const mergeSourceFiles = async (srcDir) => {
	const merged = {};

	const processDirectory = async (dirPath, basePath = '') => {
		const items = await fs.readdir(dirPath);

		for (const item of items) {
			const itemPath = path.join(dirPath, item);
			const stat = await fs.stat(itemPath);

			if (stat.isDirectory()) {
				const subPath = basePath ? `${basePath}.${item}` : item;
				await processDirectory(itemPath, subPath);
			} else if (item.endsWith('.json')) {
				const fileName = item.replace('.json', '').toLowerCase();
				const namespacePath = basePath ? `${basePath}.${fileName}` : fileName;

				try {
					const content = await fs.readFile(itemPath, 'utf8');
					const parsed = JSON.parse(content);

					// Set nested value in merged object
					const keys = namespacePath.split('.');
					const lastKey = keys.pop();
					const target = keys.reduce((current, key) => {
						current[key] ??= {};
						return current[key];
					}, merged);
					target[lastKey] = parsed;
				} catch (error) {
					console.warn(`⚠️ Error reading ${itemPath}:`, error.message);
				}
			}
		}
	};

	await processDirectory(srcDir);
	return merged;
};

// Get changed keys by comparing with cache
const getChangedKeys = async () => {
	const TRANSLATIONS_SRC_DIR = path.join(ROOT_DIR, 'translations-src');

	try {
		// Read current source files and merge them
		const current = await mergeSourceFiles(TRANSLATIONS_SRC_DIR);
		const cacheFile = path.join(CACHE_DIR, `source.last.json`);

		let previous = {};
		try {
			previous = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
		} catch {
			console.log('📝 No cache found, treating all content as new');
		}

		return deepDiff(current, previous);
	} catch (error) {
		console.error('Error reading files:', error);
		throw error;
	}
};

// Save current state as cache
const saveCache = async () => {
	const TRANSLATIONS_SRC_DIR = path.join(ROOT_DIR, 'translations-src');
	await fs.mkdir(CACHE_DIR, { recursive: true });

	const current = await mergeSourceFiles(TRANSLATIONS_SRC_DIR);
	const cacheFile = path.join(CACHE_DIR, `source.last.json`);

	await fs.writeFile(cacheFile, JSON.stringify(current, null, 2));

	console.log(`💾 Saved cache for translations-src`);
};

// Chunk changes using modern array methods with configurable size
const chunkChanges = (changes, maxKeysPerChunk = CONFIG.maxKeysPerChunk) => {
	const allChanges = { ...changes.added, ...changes.modified };
	const entries = Object.entries(allChanges);

	return Array.from({ length: Math.ceil(entries.length / maxKeysPerChunk) }, (_, i) =>
		Object.fromEntries(entries.slice(i * maxKeysPerChunk, (i + 1) * maxKeysPerChunk))
	);
};

// Batch languages for optimal API usage
const batchLanguages = (languages, batchSize = CONFIG.languageBatchSize) => {
	return Array.from({ length: Math.ceil(languages.length / batchSize) }, (_, i) =>
		languages.slice(i * batchSize, (i + 1) * batchSize)
	);
};

// Apply translations to nested object structure
const applyToNestedObject = (target, path, value) => {
	const keys = path.split('.');
	const lastKey = keys.pop();

	const parent = keys.reduce((current, key) => {
		current[key] ??= {};
		return current[key];
	}, target);

	parent[lastKey] = value;
};

// Clean up empty objects recursively
const cleanEmptyObjects = (obj) => {
	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			cleanEmptyObjects(value);
			if (Object.keys(value).length === 0) {
				delete obj[key];
			}
		}
	});
};

// Remove keys from object based on paths
const removeKeys = (obj, paths) => {
	paths.forEach((path) => {
		const keys = path.split('.');
		const lastKey = keys.pop();

		const parent = keys.reduce((current, key) => {
			if (!current?.[key]) return null;
			return current[key];
		}, obj);

		if (parent) {
			delete parent[lastKey];
		}
	});

	cleanEmptyObjects(obj);
};

// Validate translation response
const validateTranslationResponse = (response, expectedLanguages) => {
	if (typeof response !== 'object' || response === null) {
		throw new Error('Response is not an object');
	}

	for (const lang of expectedLanguages) {
		if (!(lang in response)) {
			throw new Error(`Missing translation for language: ${lang}`);
		}
		if (typeof response[lang] !== 'object') {
			throw new Error(`Invalid translation format for language: ${lang}`);
		}
	}

	return true;
};

// Translate with retry mechanism
const translateWithRetry = async (chunk, languages, maxRetries = CONFIG.maxRetries) => {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`      Attempt ${attempt}/${maxRetries}...`);

			const result = await translateWithOpenAI(chunk, languages);

			validateTranslationResponse(result, languages);

			return result;
		} catch (error) {
			console.log(`      ⚠️  Attempt ${attempt} failed: ${error.message}`);

			if (attempt === maxRetries) {
				throw error;
			}

			const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
			console.log(`      ⏳ Waiting ${delay}ms before retry...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
};

// Merge translations back into language files with error handling
const mergeTranslations = async (translations) => {
	const results = await Promise.allSettled(
		Object.entries(translations).map(async ([lang, translatedContent]) => {
			const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);

			let existing = {};
			try {
				const fileContent = await fs.readFile(filePath, 'utf8');
				existing = JSON.parse(fileContent);
			} catch (error) {
				if (error.code !== 'ENOENT') {
					console.error(`   ❌ Error reading ${lang}.json:`, error.message);
					throw error;
				}
				console.log(`   📄 Creating new file for ${lang}`);
			}

			if (typeof translatedContent !== 'object' || translatedContent === null) {
				console.error(`   ❌ Invalid translation content for ${lang}`);
				throw new Error(`Invalid translation content for ${lang}`);
			}

			let appliedCount = 0;
			let failedCount = 0;

			Object.entries(translatedContent).forEach(([path, value]) => {
				try {
					applyToNestedObject(existing, path, value);
					appliedCount++;
				} catch (error) {
					console.error(`   ❌ Error applying translation for path ${path}:`, error.message);
					failedCount++;
				}
			});

			await fs.writeFile(filePath, JSON.stringify(existing, null, 2) + '\n');
			console.log(`   💾 Updated ${lang}.json (${appliedCount} applied, ${failedCount} failed)`);

			return {
				lang,
				success: true,
				applied: appliedCount,
				failed: failedCount,
			};
		})
	);

	const failed = results.filter((r) => r.status === 'rejected');
	if (failed.length > 0) {
		console.log(`   ⚠️  Failed to update ${failed.length} language files`);
		failed.forEach((f) => console.log(`      - ${f.reason}`));
	}
};

// Main translation workflow
const translateChanges = async () => {
	console.log(`🔍 Detecting changes in translations-src folder...\n`);

	try {
		const changes = await getChangedKeys();

		const addedCount = Object.keys(changes.added).length;
		const modifiedCount = Object.keys(changes.modified).length;
		const removedCount = changes.removed.length;
		const totalChanges = addedCount + modifiedCount;

		if (totalChanges === 0 && removedCount === 0) {
			console.log('✅ No changes detected, skipping translation');
			return;
		}

		console.log(`📝 Found changes:`);

		if (addedCount > 0) {
			console.log(`   - Added: ${addedCount} keys`);
			const preview = Object.keys(changes.added).slice(0, 3).join(', ');
			console.log(`     ${preview}${addedCount > 3 ? '...' : ''}`);
		}

		if (modifiedCount > 0) {
			console.log(`   - Modified: ${modifiedCount} keys`);
			const preview = Object.keys(changes.modified).slice(0, 3).join(', ');
			console.log(`     ${preview}${modifiedCount > 3 ? '...' : ''}`);
		}

		if (removedCount > 0) {
			console.log(`   - Removed: ${removedCount} keys`);
			const preview = changes.removed.slice(0, 3).join(', ');
			console.log(`     ${preview}${removedCount > 3 ? '...' : ''}`);
		}

		if (totalChanges > 0) {
			const chunks = chunkChanges(changes);
			console.log(
				`\n📦 Split into ${chunks.length} chunks for translation (max ${CONFIG.maxKeysPerChunk} keys per chunk)`
			);

			let successfulChunks = 0;
			let failedChunks = 0;

			for (const [index, chunk] of chunks.entries()) {
				console.log(`\n🔄 Processing chunk ${index + 1}/${chunks.length}...`);
				console.log(`   Contains ${Object.keys(chunk).length} keys`);
				console.log(`   Sample keys: ${Object.keys(chunk).slice(0, 3).join(', ')}`);
				console.log(`   Total characters: ${JSON.stringify(chunk).length}`);

				try {
					const languageBatches = batchLanguages(TARGET_LANGUAGES);
					const allTranslations = {};

					for (const [batchIndex, batch] of languageBatches.entries()) {
						console.log(
							`   📤 Translating to: ${batch.join(', ')} (batch ${
								batchIndex + 1
							}/${languageBatches.length})`
						);

						try {
							const batchTranslations = await translateWithRetry(chunk, batch);
							Object.assign(allTranslations, batchTranslations);

							if (batchIndex < languageBatches.length - 1) {
								console.log(`   ⏳ Waiting ${CONFIG.apiCallDelay}ms before next batch...`);
								await new Promise((resolve) => setTimeout(resolve, CONFIG.apiCallDelay));
							}
						} catch (error) {
							console.error(`   ❌ Failed to translate batch ${batchIndex + 1}:`, error.message);
						}
					}

					if (Object.keys(allTranslations).length > 0) {
						await mergeTranslations(allTranslations);
						successfulChunks++;
					} else {
						console.log(`   ⚠️  No translations were successful for this chunk`);
						failedChunks++;
					}
				} catch (error) {
					console.error(`   ❌ Failed to process chunk ${index + 1}:`, error.message);
					failedChunks++;

					console.log('\n   ⚠️  Translation failed. Continuing with remaining chunks...');
				}
			}

			console.log(`\n📊 Translation summary:`);
			console.log(`   ✅ Successful chunks: ${successfulChunks}/${chunks.length}`);
			if (failedChunks > 0) {
				console.log(`   ❌ Failed chunks: ${failedChunks}/${chunks.length}`);
			}
		}

		if (removedCount > 0) {
			console.log('\n🗑️  Removing deleted keys from all languages...');

			const removalResults = await Promise.allSettled(
				TARGET_LANGUAGES.map(async (lang) => {
					const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);

					try {
						const existing = JSON.parse(await fs.readFile(filePath, 'utf8'));
						removeKeys(existing, changes.removed);

						await fs.writeFile(filePath, JSON.stringify(existing, null, 2) + '\n');
						console.log(`   🗑️  Cleaned ${lang}.json`);
						return { lang, success: true };
					} catch (error) {
						if (error.code !== 'ENOENT') {
							console.error(`   ❌ Failed to clean ${lang}.json:`, error.message);
						}
						return { lang, success: false, error };
					}
				})
			);

			const failedRemovals = removalResults.filter((r) => r.status === 'rejected');
			if (failedRemovals.length > 0) {
				console.log(`   ⚠️  Failed to clean ${failedRemovals.length} files`);
			}
		}

		await saveCache();
		console.log('\n✅ Translation complete!');
	} catch (error) {
		console.error('❌ Translation failed:', error);
		process.exit(1);
	}
};

// Run if called directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	if (!process.env.OPENAI_API_KEY) {
		console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
		console.log('💡 Make sure you have a .env.local file with OPENAI_API_KEY=sk-...');
		process.exit(1);
	}

	translateChanges().catch(console.error);
}

export { chunkChanges, getChangedKeys, mergeTranslations, saveCache };
