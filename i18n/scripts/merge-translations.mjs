import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to i18n folder
const ROOT_DIR = path.resolve(__dirname, '../..');
const TRANSLATIONS_SRC_DIR = path.join(ROOT_DIR, 'translations-src');
const OUTPUT_DIR = path.join(ROOT_DIR, 'translations');

const ensureDir = async (dir) => {
	await fs.mkdir(dir, { recursive: true });
};

// Helper function to set nested value
const setNestedValue = (obj, path, value) => {
	const keys = path.split('.');
	const lastKey = keys.pop();

	const target = keys.reduce((current, key) => {
		current[key] ??= {};
		return current[key];
	}, obj);

	// Merge if both are objects, otherwise set
	target[lastKey] =
		target[lastKey] && typeof target[lastKey] === 'object' && typeof value === 'object'
			? { ...target[lastKey], ...value }
			: value;
};

const processDirectory = async (dirPath, basePath = '') => {
	const items = await fs.readdir(dirPath);

	const results = await Promise.all(
		items.map(async (item) => {
			const itemPath = path.join(dirPath, item);
			const stat = await fs.stat(itemPath);

			if (stat.isDirectory()) {
				// Recursively process subdirectories
				const subPath = basePath ? `${basePath}.${item}` : item;
				return processDirectory(itemPath, subPath);
			}

			if (item.endsWith('.json')) {
				// Process JSON file
				const fileName = item.replace('.json', '').toLowerCase();
				const namespacePath = basePath ? `${basePath}.${fileName}` : fileName;

				try {
					const content = await fs.readFile(itemPath, 'utf8');
					const parsed = JSON.parse(content);

					console.log(`  ✓ Processing: ${namespacePath} - Keys: ${Object.keys(parsed).join(', ')}`);

					return { [namespacePath]: parsed };
				} catch (error) {
					console.warn(`  ⚠️  Error in ${itemPath}:`, error.message);
					return null;
				}
			}

			return null;
		})
	);

	// Flatten results and filter out nulls
	return Object.assign({}, ...results.flat().filter(Boolean));
};

const mergeTranslations = async () => {
	console.log('🔄 Merging translations...');
	console.log(`📁 Source directory: ${TRANSLATIONS_SRC_DIR}`);
	console.log(`📁 Output directory: ${OUTPUT_DIR}`);

	// Create output directory
	await ensureDir(OUTPUT_DIR);

	// Check if source directory exists
	try {
		await fs.access(TRANSLATIONS_SRC_DIR);
	} catch {
		console.error(`❌ Source directory not found: ${TRANSLATIONS_SRC_DIR}`);
		process.exit(1);
	}

	console.log(`\n📋 Processing files from translations-src...`);

	// Process all files directly from translations-src
	const fileData = await processDirectory(TRANSLATIONS_SRC_DIR);

	// Build nested structure
	const merged = {};
	Object.entries(fileData).forEach(([namespacePath, content]) => {
		setNestedValue(merged, namespacePath, content);
	});

	// Save merged translations as English
	const outputPath = path.join(OUTPUT_DIR, 'en.json');
	await fs.writeFile(outputPath, JSON.stringify(merged, null, 2) + '\n');

	const namespaceCount = Object.keys(fileData).length;
	console.log(`✅ Created en.json with ${namespaceCount} namespaces`);

	console.log('\n✨ Translations merged successfully!');
};

// Run the script
mergeTranslations().catch(console.error);
