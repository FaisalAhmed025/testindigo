export function getFormatDateTimeWithSpace() {
    return momentZone(getDhakaTime(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
}