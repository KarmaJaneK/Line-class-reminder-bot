// test/handlers.test.js

// Import the functions and modules
const { handleEvent, sendReminders } = require('../handlers.js');
const lineClient = require('../lineClient');
const airtableBase = require('../airtableClient');

// Mock external dependencies
jest.mock('../lineClient');
jest.mock('../airtableClient');

describe('handleEvent', () => {
    const mockReplyMessage = jest.fn();
    const mockUpdate = jest.fn();
    const mockSelect = jest.fn();

    beforeEach(() => {
        lineClient.replyMessage = mockReplyMessage;
        airtableBase.mockReturnValue({
            select: mockSelect,
            update: mockUpdate,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return null if event type is not message', async () => {
        const event = { type: 'follow' }; // Not a message event
        const result = await handleEvent(event);
        expect(result).toBeNull();
    });

    it('should update record and reply when message contains "will attend"', async () => {
        const event = {
            type: 'message',
            message: { type: 'text', text: 'I will attend' },
            replyToken: 'testReplyToken',
            source: { userId: 'user123' },
        };

        const mockRecords = [{ id: 'rec123', fields: { 'Line ID': 'user123' } }];
        mockSelect.mockReturnValue({ all: jest.fn().mockResolvedValue(mockRecords) });

        await handleEvent(event);

        expect(mockUpdate).toHaveBeenCalledWith('rec123', {
            'Will attend': true,
            'Will not attend': false,
        });
        expect(mockReplyMessage).toHaveBeenCalledWith('testReplyToken', {
            type: 'text',
            text: `Received your message: I will attend`,
        });
    });

    it('should update record and reply when message contains "will not attend"', async () => {
        const event = {
            type: 'message',
            message: { type: 'text', text: 'I will not attend' },
            replyToken: 'testReplyToken',
            source: { userId: 'user123' },
        };

        const mockRecords = [{ id: 'rec123', fields: { 'Line ID': 'user123' } }];
        mockSelect.mockReturnValue({ all: jest.fn().mockResolvedValue(mockRecords) });

        await handleEvent(event);

        expect(mockUpdate).toHaveBeenCalledWith('rec123', {
            'Will attend': false,
            'Will not attend': true,
        });
        expect(mockReplyMessage).toHaveBeenCalledWith('testReplyToken', {
            type: 'text',
            text: `Received your message: I will not attend`,
        });
    });
});

describe('sendReminders', () => {
    const mockPushMessage = jest.fn();
    const mockUpdate = jest.fn();
    const mockSelect = jest.fn();

    beforeEach(() => {
        lineClient.pushMessage = mockPushMessage;
        airtableBase.mockReturnValue({
            select: mockSelect,
            update: mockUpdate,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send reminders for classes scheduled tomorrow with no confirmation', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        const mockRecords = [{
            id: 'rec123',
            fields: {
                'Booking date/time': `${tomorrowDate}T10:00:00Z`,
                'Line ID': 'user123',
                'Reminder sent': false,
                'Will attend': undefined,
                'Will not attend': undefined,
            }
        }];
        mockSelect.mockReturnValue({ all: jest.fn().mockResolvedValue(mockRecords) });

        await sendReminders();

        expect(mockPushMessage).toHaveBeenCalledWith('user123', {
            type: 'text',
            text: expect.stringContaining('GReminder: You have a class scheduled'),
        });
        expect(mockUpdate).toHaveBeenCalledWith('rec123', { 'Reminder sent': true });
    });

    it('should not send reminders if reminder already sent', async () => {
        const mockRecords = [{
            id: 'rec123',
            fields: {
                'Booking date/time': new Date().toISOString().split('T')[0] + 'T10:00:00Z',
                'Line ID': 'user123',
                'Reminder sent': true, // Reminder already sent
                'Will attend': undefined,
                'Will not attend': undefined,
            }
        }];
        mockSelect.mockReturnValue({ all: jest.fn().mockResolvedValue(mockRecords) });

        await sendReminders();

        expect(mockPushMessage).not.toHaveBeenCalled();
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});