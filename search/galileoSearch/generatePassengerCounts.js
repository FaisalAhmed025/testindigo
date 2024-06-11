function generatePassengerCounts(adultCount = 0, childCount = 0, infantCount = 0) {
    const passengers = [];

    if (adultCount > 0) {
        passengers.push({type: 'ADT', count: adultCount});
    }
    if (childCount > 0) {
        passengers.push({type: 'CNN', count: childCount});
    }
    if (infantCount > 0) {
        passengers.push({type: 'INF', count: infantCount});
    }

    return passengers;
}

export default generatePassengerCounts