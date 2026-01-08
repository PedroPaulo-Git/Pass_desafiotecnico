import { ApiProperty } from '@nestjs/swagger';

export class TicketTrendDto {
    @ApiProperty()
    month: string;

    @ApiProperty()
    count: number;

    @ApiProperty()
    opened: number;

    @ApiProperty()
    closed: number;
}

export class MessageStatsDto {
    @ApiProperty()
    totalMessages: number;

    @ApiProperty()
    totalAttachments: number;

    @ApiProperty()
    avgMessagesPerTicket: number;
}

export class TotalsDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    open: number;

    @ApiProperty()
    inProgress: number;

    @ApiProperty()
    resolved: number;

    @ApiProperty()
    closed: number;
}

export class PercentageChangeDto {
    @ApiProperty()
    tickets: number;

    @ApiProperty()
    messages: number;
}

export class HelpdeskStatisticsDto {
    @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
    ticketsByStatus: Record<string, number>;

    @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
    ticketsByPriority: Record<string, number>;

    @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
    ticketsByModule: Record<string, number>;

    @ApiProperty({ type: [TicketTrendDto] })
    ticketsTrend: TicketTrendDto[];

    @ApiProperty({ type: MessageStatsDto })
    messagesStats: MessageStatsDto;

    @ApiProperty({ type: TotalsDto })
    totals: TotalsDto;

    @ApiProperty({ type: PercentageChangeDto })
    percentageChange: PercentageChangeDto;

    @ApiProperty({ description: 'Role of the requesting user' })
    role: string;

    @ApiProperty({ description: 'User ID for role-specific stats', required: false })
    userId?: string;
}
