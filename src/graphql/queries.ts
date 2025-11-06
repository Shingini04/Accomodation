import { gql } from "@apollo/client";

export const GET_ACCOMMODATIONS = gql`
  query GetAccommodations {
    getAccommodations {
      accoId
      name
      email
      mobile
      gender
      organization
      arrivalDate
      departureDate
      numberOfPeople
      accommodationType
      amount
      paid
      orderId
      paymentId
      checkInAt
      checkOutAt
      createdAt
      user {
        id
        name
        email
      }
      allotment {
        id
        room {
          roomNumber
          hostelName
        }
      }
    }
  }
`;

export const GET_ACCOMMODATION = gql`
  query GetAccommodation($id: String!) {
    getAccommodation(id: $id) {
      accoId
      name
      email
      mobile
      dob
      gender
      idType
      idNumber
      address
      organization
      arrivalDate
      departureDate
      numberOfPeople
      accommodationType
      accommodationDates
      amount
      paid
      orderId
      paymentId
      termsAndConditions
      checkInAt
      checkOutAt
      createdAt
      user {
        id
        name
        email
      }
      allotment {
        id
        room {
          id
          roomNumber
          hostelName
          roomType
        }
        allottedBy
        notes
        createdAt
      }
    }
  }
`;

export const POLL_ACCOMMODATION_PAYMENT = gql`
  query PollAccommodationPayment($orderId: String!) {
    pollAccommodationPayment(orderId: $orderId) {
      accoId
      paid
      paymentId
    }
  }
`;

export const GET_ROOMS = gql`
  query GetRooms {
    getRooms {
      id
      roomNumber
      hostelName
      roomType
      capacity
      occupied
      available
    }
  }
`;

export const GET_AVAILABLE_ROOMS = gql`
  query GetAvailableRooms {
    getAvailableRooms {
      id
      roomNumber
      hostelName
      roomType
      capacity
      occupied
      available
    }
  }
`;

export const GET_SUPPORT_TICKETS = gql`
  query GetSupportTickets {
    getSupportTickets {
      id
      userId
      name
      email
      category
      message
      status
      response
      respondedBy
      respondedAt
      createdAt
    }
  }
`;

export const GET_USER_SUPPORT_TICKETS = gql`
  query GetUserSupportTickets($userId: String!) {
    getUserSupportTickets(userId: $userId) {
      id
      category
      message
      status
      response
      respondedAt
      createdAt
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalAccommodations
      paidAccommodations
      pendingAccommodations
      totalRooms
      occupiedRooms
      occupancyRate
      maleParticipants
      femaleParticipants
      otherGenderParticipants
      totalRevenue
      checkedIn
      checkedOut
      openTickets
    }
  }
`;

export const GET_HOSTEL_UTILIZATION = gql`
  query GetHostelUtilization {
    getHostelUtilization {
      hostelName
      totalRooms
      occupiedRooms
      totalCapacity
      occupiedCapacity
      utilizationRate
    }
  }
`;

export const GET_PAYMENT_STATS = gql`
  query GetPaymentStats {
    getPaymentStats {
      date
      amount
      count
    }
  }
`;

export const EXPORT_ACCOMMODATIONS_CSV = gql`
  query ExportAccommodationsCSV {
    exportAccommodationsCSV
  }
`;

export const EXPORT_ROOMS_CSV = gql`
  query ExportRoomsCSV {
    exportRoomsCSV
  }
`;

export const EXPORT_PAYMENTS_CSV = gql`
  query ExportPaymentsCSV {
    exportPaymentsCSV
  }
`;
