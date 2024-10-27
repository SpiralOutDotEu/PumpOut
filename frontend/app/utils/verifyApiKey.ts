export function verifyApiKey(apiKey: string): boolean {
    const authorizedKeys = process.env.AUTHORIZED_API_KEYS?.split(",") || [];
    return authorizedKeys.includes(apiKey);
}
