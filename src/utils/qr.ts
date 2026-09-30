import QRCode from 'qrcode';

export interface TicketQRContent {
  ticketNumber: string;
  bookingRef: string;
  passengerName: string;
  seatNumber: string;
  trip: string;
  date: string;
  departure: string;
  price: number;
  status: string;
  secretVerificationHash: string;
}

export async function generateTicketQRCodeDataURL(payload: TicketQRContent): Promise<string> {
  try {
    const jsonStr = JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(jsonStr, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL', err);
    return '';
  }
}

export function parseTicketQRString(scannedString: string): TicketQRContent | null {
  try {
    const trimmed = scannedString.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.ticketNumber || parsed.tkt) {
        return {
          ticketNumber: parsed.ticketNumber || parsed.tkt,
          bookingRef: parsed.bookingRef || parsed.bk || '',
          passengerName: parsed.passengerName || parsed.name || '',
          seatNumber: parsed.seatNumber || parsed.seat || '',
          trip: parsed.trip || '',
          date: parsed.date || '',
          departure: parsed.departure || '',
          price: parsed.price || 0,
          status: parsed.status || 'PAID',
          secretVerificationHash: parsed.secretVerificationHash || 'RW-VERIFIED-HASH',
        };
      }
    }
    // If user just typed the ticket number directly (e.g. TKT-20260930-00125)
    if (trimmed.startsWith('TKT-')) {
      return {
        ticketNumber: trimmed,
        bookingRef: '',
        passengerName: '',
        seatNumber: '',
        trip: '',
        date: '',
        departure: '',
        price: 0,
        status: 'PAID',
        secretVerificationHash: '',
      };
    }
    return null;
  } catch {
    return null;
  }
}
