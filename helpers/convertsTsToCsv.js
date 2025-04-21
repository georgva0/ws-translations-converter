// Import necessary Node.js modules
const fs = require("fs");
const path = require("path");

/**
 * Flattens a nested object into an array of { path: string, value: string } pairs.
 * Only includes properties with string values.
 *
 * @param {object} obj The object to flatten.
 * @param {string} [parentPath=''] The base path for the current level.
 * @param {Array<{path: string, value: string}>} [result=[]] The accumulator array.
 * @returns {Array<{path: string, value: string}>} The flattened structure.
 */
function flattenObject(obj, parentPath = "", result = []) {
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newPath = parentPath ? `${parentPath}.${key}` : key;
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Recurse into nested objects
        flattenObject(value, newPath, result);
      } else if (typeof value === "string") {
        // Add string properties to the result
        result.push({ path: newPath, value: value });
      }
      // You could add handling for other types (numbers, booleans, arrays) here if needed
    }
  }
  return result;
}

/**
 * Reads a TypeScript file exporting an object, extracts key paths and string values,
 * and writes them to a CSV file.
 *
 * @param {string} tsFilePath Path to the input TypeScript file.
 * @param {string} csvFilePath Path to the output CSV file.
 */
async function convertTsTranslationsToCsv(tsFilePath, csvFilePath) {
  try {
    console.log(`Attempting to load translations from: ${tsFilePath}`);

    // Resolve the absolute path
    const absoluteTsPath = path.resolve(tsFilePath);

    // Dynamically import the TypeScript file's exported object
    // This relies on Node.js being able to handle the .ts file
    // (e.g., via ts-node or pre-compilation)
    const translations = require(absoluteTsPath);

    // Handle default exports (common in TS)
    const translationObject = translations.default || translations;

    if (typeof translationObject !== "object" || translationObject === null) {
      throw new Error(
        `Failed to load a valid object from ${tsFilePath}. Found: ${typeof translationObject}`
      );
    }

    console.log("Successfully loaded translations.");

    // Flatten the object
    const flattenedData = flattenObject(translationObject);

    if (flattenedData.length === 0) {
      console.warn(
        `No string key-value pairs found in ${tsFilePath}. CSV will be empty.`
      );
      // Create an empty file or just the header
      fs.writeFileSync(csvFilePath, "Path,Value\n");
      return;
    }

    // Prepare CSV content
    // Using simple string concatenation for CSV. For very large files or complex
    // data (e.g., values containing commas or quotes), a dedicated CSV library
    // like 'csv-writer' or 'papaparse' is recommended for proper escaping.
    const header = "Path,Value\n";
    const csvRows = flattenedData.map((item) => {
      // Basic CSV escaping: double quotes around values containing commas or quotes
      let formattedValue = item.value;
      if (formattedValue.includes(",") || formattedValue.includes('"')) {
        formattedValue = `"${formattedValue.replace(/"/g, '""')}"`;
      }
      return `${item.path},${formattedValue}`;
    });

    const csvContent = header + csvRows.join("\n");

    // Write to CSV file
    fs.writeFileSync(csvFilePath, csvContent);
    console.log(`Successfully converted translations to ${csvFilePath}`);
  } catch (error) {
    console.error(`Error during conversion: ${error.message}`);
    // console.error(error.stack); // Uncomment for more detailed stack trace
  }
}

// --- Example Usage ---

// Define the input and output file paths
const inputFile = "./samples.portuguese.ts"; // Adjust path as needed
const outputFile = "./translations_pt.csv"; // Desired output CSV file name

// Create a dummy input file for testing if it doesn't exist
if (!fs.existsSync(inputFile)) {
  console.log(`Creating dummy input file: ${inputFile}`);
  const dummyContent = `
export default {
  service: {
    default: {
      lang: 'pt-BR',
      currency: 'BRL',
      feature: {
        enabled: true, // This boolean won't be included
        name: "Recurso Principal"
      }
    },
    name: 'Serviço Exemplo',
  },
  common: {
    hello: 'Olá',
    goodbye: 'Adeus',
    messageWithComma: 'Valor, com vírgula',
    messageWithQuotes: 'Valor com "aspas"',
  },
  arrayValue: ['a', 'b'], // This array won't be included
};
`;
  fs.writeFileSync(inputFile, dummyContent.trim());
}

// Run the conversion function
convertTsTranslationsToCsv(inputFile, outputFile);

// To run this script:
// 1. Save it as a .js file (e.g., convert.js).
// 2. Make sure you have Node.js installed.
// 3. Install ts-node: `npm install --save-dev ts-node typescript` or `npm install -g ts-node typescript`
// 4. Ensure your `samples.portuguese.ts` file exists in the same directory (or adjust the path).
// 5. Run from your terminal: `ts-node convert.js` (if using local install: `npx ts-node convert.js`)
