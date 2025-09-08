import { FormatRegistry } from '@sinclair/typebox';
// Configure TypeBox format validators
FormatRegistry.Set('uuid', (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidRegex.test(value);
});
FormatRegistry.Set('email', (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value);
});
FormatRegistry.Set('date-time', (value) => {
    if (typeof value !== 'string')
        return false;
    const date = new Date(value);
    if (isNaN(date.getTime()))
        return false;
    // Check if it's a valid ISO 8601 date-time string
    // Accept formats like: 2024-12-31T23:59:59Z, 2024-12-31T23:59:59.000Z, 2024-12-31T23:59:59+00:00
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    return iso8601Regex.test(value);
});
FormatRegistry.Set('date', (value) => {
    if (typeof value !== 'string')
        return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && value === date.toISOString().split('T')[0];
});
FormatRegistry.Set('time', (value) => {
    if (typeof value !== 'string')
        return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?$/;
    return timeRegex.test(value);
});
FormatRegistry.Set('uri', (value) => {
    if (typeof value !== 'string')
        return false;
    try {
        new URL(value);
        return true;
    }
    catch {
        return false;
    }
});
FormatRegistry.Set('hostname', (value) => {
    if (typeof value !== 'string')
        return false;
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return hostnameRegex.test(value) && value.length <= 253;
});
FormatRegistry.Set('ipv4', (value) => {
    if (typeof value !== 'string')
        return false;
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(value);
});
FormatRegistry.Set('ipv6', (value) => {
    if (typeof value !== 'string')
        return false;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(value);
});
export { FormatRegistry };
//# sourceMappingURL=format-validators.js.map