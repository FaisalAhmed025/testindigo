export const filterUserAgent = data => {

    // Filter string values
    const filteredData = Object.fromEntries(
        Object.entries(data)
            .filter(([key, value]) => typeof value !== 'boolean')
    );

// Get boolean properties that are true
    const trueBooleanProperties = Object.keys(data)
        .filter(key => typeof data[key] === 'boolean' && data[key]);

    return {...filteredData, ...Object.fromEntries(trueBooleanProperties.map(prop => [prop, true]))}
}