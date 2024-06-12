import commonFunctions from "./commonFunctions";
import {DOMParser} from 'xmldom';
import replaceStrings from "./replaceStrings";

const CACHE_DURATION = 2 * 60 * 1000; // Cache duration of 3 minutes
let cacheLastUpdated = null;

// Cache object to store processed results
const cache = {};

// Function to process text with caching and memoization
function memoizeProcessText(text) {
    const cacheKey = text;
    const now = Date.now();

    // Check if the cache is valid and contains the desired key
    if (cacheLastUpdated && (now - cacheLastUpdated <= CACHE_DURATION) && cache[cacheKey]) {
        // Return cached result if within cache duration
        return cache[cacheKey];
    }

    // Process the text and store the result in the cache
    const result = processText(text);
    const x =Indigoformatetext(result)
    cache[cacheKey] = x;
    cacheLastUpdated = now;
    return x;
}


function Indigoformatetext(text){
     // Split by comma
     const splitDescriptions = text.flatMap(description => description.split(/\.\s*/));
     return splitDescriptions;
}



// Function to stringify and clean the text
const stringifyText = (text) => {
    return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
};
const processText = (text) => {
    const cleanedText = stringifyText(JSON.parse(JSON.stringify(text)));

    // console.log(cleanedText)
    return containsSpecialChars(cleanedText) ? splitTextIntoLines(text) : processPlainText(text);
};

// Function to check if the text contains special characters
const containsSpecialChars = (text) => {
    const specialCharPattern = /[-•]\s*[A-Z]/;
    return specialCharPattern.test(text);
};

const processPlainText = (text) => {
    // Remove unwanted line breaks and extra spaces

    // console.log(text)
    const pattern = /INCLUDES:(.*?)(NOTE:|$)/s;

    // Extract the matched text
    const matches = text.match(pattern);
    const undesiredStrings = ['Inclusions', 'Fare provides', 'Includes:', 'Our'];

    // If matches were found, split the matched text into lines
    if (matches && matches[1]) {
        const lines = text.trim().split('\n').map(line => line.trim());
        const filteredLines = lines.filter((line, index) => {
            // Ignore case while checking for "includes:", "Our", and "fare provides"
            return !undesiredStrings.some(string => line.toLowerCase().includes(string.toLowerCase()));
        }).map(line => line.replace(/^\W+/, ''));

        // Remove empty strings from the filtered lines
        //    const nonEmptyLines = filteredLines.filter(line => line.trim() !== '');
// Remove any leading special characters

        // console.log(nonEmptyLines)
        return  filterLine(filteredLines);

        // return  finalLines;
    }

    return []
};

function filterLine( filteredLines) {
    const unwantedChars = ['*', '˄']
    const nonEmptyLines = filteredLines.filter(line => line !== '');
    // Further clean to remove unmatched parentheses and trim
    const finalLines = nonEmptyLines.map(line => {
        // Regular expression for flexible two-word service matching (with or without slash)
        const servicePattern = /([^\s\/]+)\s*\/?\s*([^\s\/]+)\s*/;

        let cleanedLine = line;

        // Remove unmatched opening parentheses
        if ((cleanedLine.match(/\(/g) || []).length > (cleanedLine.match(/\)/g) || []).length) {
            cleanedLine = cleanedLine.replace(/\(/g, '');
        }
        // Remove unmatched closing parentheses
        if ((cleanedLine.match(/\)/g) || []).length > (cleanedLine.match(/\(/g) || []).length) {
            cleanedLine = cleanedLine.replace(/\)/g, '');
        }

        /* if (servicePattern.test(cleanedLine)) {

               console.log({cleanedLine})
         }*/
        // Remove unwanted characters
        unwantedChars.forEach(char => {
            cleanedLine = cleanedLine.split(char).join('').trim();
        });
        return cleanedLine.trim().replace(/(\w+)\/(\w+)/g, '$1 or $2');
    });
    return  processLines(finalLines);
}

// Function to split text content into lines
const splitTextIntoLines = (text) => {
    // console.log({to: 'html tags'})
    // Remove unwanted line breaks and extra spaces
    // Define the patterns to ignore for splitting
    const ignorePatterns = ["Wi-Fi"];
    const ignorePatternRegex = new RegExp(ignorePatterns.join('|'), 'i');
    // Create a regular expression for splitting, ignoring specified patterns
    const splitPattern = new RegExp(`(?<=\\s-\\s)(?=[A-Z0-9])|(?<=\\s·\\s)(?=[A-Z0-9])(?<!${ignorePatterns.join("|")})`, 'i');

    // console.log({text})
    const cleanedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    // console.log({cleanedText})
    // Remove unwanted line breaks and extra spaces
    // Clean and trim the text
    const cleanedAndTrimmedText = cleanedText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    //  console.log({ cleanedAndTrimmedText });

    // Split the text based on valid hyphens followed by uppercase letters or digits
    // Split the text based on valid hyphens followed by uppercase letters or digits
    const splitLines = cleanedAndTrimmedText.split(splitPattern).map(line => line.trim());

    //console.log({ splitLines });
    splitLines.forEach((line, index) => {
        if (line.includes(';') || line.includes('•')|| line.includes('▪')) {
            const separators = [';', '•', '▪'];
            const regex = new RegExp(`[${separators.join('')}]`);
            let subLines = line.split(regex).map(subLine => subLine.trim());

            // For each subline, further split based on - followed by an uppercase letter
            subLines = subLines.flatMap(subLine => {

                if (subLine.match(/-\s*[A-Z]/) && !ignorePatternRegex.test(subLine)) {
                    const parts = subLine.split(/(?=-\s*[A-Z])/).map(subSubLine => subSubLine.trim());
                    return parts.slice(1); // Remove the first elemen
                    // return subLine.split(/(?=-\s*[A-Z])/).map(subSubLine => subSubLine.trim());
                }
                return subLine;
            });

            splitLines.splice(index, 1, ...subLines);
        }
        else if (line.match(/-\s[A-Z]/) &&!ignorePatternRegex.test(line)) {
            const subLines = line.split(/(?=-\s[A-Z])/).map(subLine => subLine.trim());
            splitLines.splice(index, 1, ...subLines);
        } else if (line.includes('-C') && !ignorePatternRegex.test(line)) {
            const subLines = line.split(/(?<=-)(?=[A-Z])/).map(subLine => subLine.trim());
            splitLines.splice(index, 1, ...subLines);
        }
    });

//    console.log({ splitLines });


    // Regular expressions to match undesired strings and leading/trailing special characters
    const undesiredStrings = ['Inclusions', 'Fare provides', 'Includes:', 'Our'];
    const specialCharacters = /^[\W\s]+|[^\w\s()]$/g;

    // Filter out the lines containing the undesired strings
    const filteredLines = splitLines.filter((line, index) => {
        // Check if the line matches any of the undesired strings and if it's the first line (index === 0)
        return !undesiredStrings.some(string => line.toLowerCase().includes(string.toLowerCase()));

    }).map(line => line.replace(/^\W+|\W+$/g, '').trim()); // Remove any leading/trailing special characters and trim


    // Remove empty strings from the filtered lines
    //  console.log({filteredLines})
    const finalLines = filterLine(filteredLines);


    //  console.log({finalLines})

    //return processedLines;

    return finalLines;


};


/**
 * Processes the given lines and updates them based on specific conditions.
 * @param {string[]} lines - The array of lines to process.
 * @returns {string[]} - The updated array of lines.
 */
function processLines(lines) {
    const updatedLines = [];

    lines.forEach(line => {
        let matched = false;
        for (const [key, valueFn] of Object.entries(replaceStrings)) {
            const regex = new RegExp(key, 'i');
            const match = line.match(regex);
            if (match) {
                updatedLines.push(...valueFn(...match));
                matched = true;
                break;
            }
        }
        if (!matched) {
            updatedLines.push(line);
        }
    });

    return updatedLines;
}



function processBrand( etree,brandElement, fareAttributeData, airPrice) {
    let brandAttribute = commonFunctions.attributeToObject(brandElement?.attrib);

    // console.log({fareAttributeData, brandAttribute})
    // Get class information of the brand
    brandAttribute.class = (brandElement?.find('air:Title[@Type="External"]', etree.namespaces)?.text ?? '').trim();
    brandAttribute.code = (brandElement?.find('air:Title[@Type="Short"]', etree.namespaces)?.text ?? '').trim();

    brandAttribute.ApproximateBasePrice = airPrice.ApproximateBasePrice || '';
    brandAttribute.ApproximateTaxes = airPrice.ApproximateTaxes || '';
    const textContent = (brandElement?.find('air:Text[@Type="MarketingAgent"]', etree.namespaces)?.text || brandElement?.find('air:Text[@Type="Upsell"]', etree.namespaces)?.text || '').trim();
    fareAttributeData.description = memoizeProcessText(textContent);

    brandAttribute.FareBasis  = fareAttributeData?.FareBasis || ""
    brandAttribute.brandTier = fareAttributeData?.BrandTier || ""

   // console.log(brandAttribute, fareAttributeData)

    const seenBrands = commonFunctions.brandMaker(brandAttribute);
    const feature = commonFunctions.featuredMaker(fareAttributeData);

    return {seenBrands, feature};
}

export default processBrand