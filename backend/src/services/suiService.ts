export async function processSuiEvent(eventData: any): Promise<any> {
    // Example SUI-specific logic
    console.log('Processing SUI event:', eventData);

    // Return standardized result
    return {
        success: true,
        message: 'SUI event processed successfully',
        data: eventData,
    };
}
