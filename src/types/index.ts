import { Event, Booking, WaitingList, BookingStatus } from '../../generated/prisma/client';

export type { Event, Booking, WaitingList, BookingStatus  };

export interface EventStatus {
    eventId: string;
    name: string;
    totalTickets: number;
    availableTickets: number;
    confirmedBookings: number;
    waitingListCount: number;
}

export interface BookingResult {
    success: boolean;
    bookingId?: string;
    waitingId?: string;
    status: BookingStatus;
    position?: number;
    message: string;
}

export interface CancellationResult {
    success: boolean;
    cancelledBooking: string;
    assignedToWaitingList?: string;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface InitializeEventRequest {
    name: string;
    totalTickets: number;
}

export interface BookTicketRequest {
    eventId: string;
    userId: string;
}

export interface CancelBookingRequest {
    bookingId: string;
}