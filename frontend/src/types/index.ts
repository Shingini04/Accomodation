export interface User {
  id: string;
  shaastraId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

export interface Accommodation {
  accoId: string;
  user: User;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  idType: string;
  idNumber: string;
  address: string;
  organization: string;
  arrivalDate: string;
  departureDate: string;
  numberOfPeople: number;
  accommodationType: string;
  accommodationDates: string;
  amount: number;
  paid: boolean;
  orderId?: string;
  paymentId?: string;
  paymentSignature?: string;
  termsAndConditions: boolean;
  idProofUrl?: string;
  eventName?: string;
  allotment?: Allotment;
  checkInAt?: Date;
  checkOutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  roomNumber: string;
  hostelName: string;
  roomType: string;
  capacity: number;
  occupied: number;
  available: boolean;
}

export interface Allotment {
  id: string;
  accommodation: Accommodation;
  room: Room;
  allottedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
}

export interface DashboardStats {
  totalAccommodations: number;
  paidAccommodations: number;
  pendingAccommodations: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  maleParticipants: number;
  femaleParticipants: number;
  otherGenderParticipants: number;
  totalRevenue: number;
  checkedIn: number;
  checkedOut: number;
  openTickets: number;
}

export interface HostelUtilization {
  hostelName: string;
  totalRooms: number;
  occupiedRooms: number;
  totalCapacity: number;
  occupiedCapacity: number;
  utilizationRate: number;
}

export interface PaymentStats {
  date: string;
  amount: number;
  count: number;
}
