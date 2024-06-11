export function flattenObject(obj, prefix = '') {
    const flatObject = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(flatObject, flattenObject(obj[key], newKey));
            } else {
                flatObject[newKey] = obj[key];
            }
        }
    }

    return flatObject;
}
