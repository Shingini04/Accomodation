import { Accommodation } from "../entities/Accommodation";
import { Room } from "../entities/Room";
import { PaymentTransaction } from "../entities/PaymentTransaction";

export function generateCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(",");
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function accommodationsToCSV(accommodations: Accommodation[]): string {
  const headers = [
    "accoId",
    "name",
    "email",
    "mobile",
    "gender",
    "organization",
    "arrivalDate",
    "departureDate",
    "numberOfPeople",
    "accommodationType",
    "amount",
    "paid",
    "orderId",
    "paymentId",
    "createdAt",
  ];

  const data = accommodations.map(acc => ({
    accoId: acc.accoId,
    name: acc.name,
    email: acc.email,
    mobile: acc.mobile,
    gender: acc.gender,
    organization: acc.organization,
    arrivalDate: acc.arrivalDate,
    departureDate: acc.departureDate,
    numberOfPeople: acc.numberOfPeople,
    accommodationType: acc.accommodationType,
    amount: acc.amount,
    paid: acc.paid ? "Yes" : "No",
    orderId: acc.orderId || "",
    paymentId: acc.paymentId || "",
    createdAt: acc.createdAt.toISOString(),
  }));

  return generateCSV(data, headers);
}

export function roomsToCSV(rooms: Room[]): string {
  const headers = [
    "id",
    "roomNumber",
    "hostelName",
    "roomType",
    "capacity",
    "occupied",
    "available",
  ];

  const data = rooms.map(room => ({
    id: room.id,
    roomNumber: room.roomNumber,
    hostelName: room.hostelName,
    roomType: room.roomType,
    capacity: room.capacity,
    occupied: room.occupied,
    available: room.available ? "Yes" : "No",
  }));

  return generateCSV(data, headers);
}

export function paymentsToCSV(payments: PaymentTransaction[]): string {
  const headers = [
    "id",
    "accommodationId",
    "orderId",
    "paymentId",
    "amount",
    "currency",
    "status",
    "method",
    "createdAt",
  ];

  const data = payments.map(payment => ({
    id: payment.id,
    accommodationId: payment.accommodationId,
    orderId: payment.orderId,
    paymentId: payment.paymentId || "",
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method || "",
    createdAt: payment.createdAt.toISOString(),
  }));

  return generateCSV(data, headers);
}
