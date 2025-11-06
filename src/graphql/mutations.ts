import { gql } from "@apollo/client";

export const CREATE_ACCOMMODATION = gql`
  mutation CreateAccommodation($data: CreateAccommodationInput!) {
    createAccommodation(data: $data) {
      accoId
      orderId
      amount
      paid
      createdAt
    }
  }
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
  mutation VerifyRazorpayPayment($orderId: String!, $paymentId: String!, $signature: String!) {
    verifyRazorpayPayment(orderId: $orderId, paymentId: $paymentId, signature: $signature) {
      accoId
      paid
      paymentId
      name
      email
      accommodationDates
    }
  }
`;

export const CREATE_ALLOTMENT = gql`
  mutation CreateAllotment($data: CreateAllotmentInput!) {
    createAllotment(data: $data) {
      id
      accommodation {
        accoId
        name
      }
      room {
        id
        roomNumber
        hostelName
      }
      allottedBy
      createdAt
    }
  }
`;

export const UPDATE_CHECK_IN_OUT = gql`
  mutation UpdateCheckInOut($data: UpdateCheckInOutInput!) {
    updateCheckInOut(data: $data) {
      accoId
      checkInAt
      checkOutAt
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation CreateRoom($data: CreateRoomInput!) {
    createRoom(data: $data) {
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

export const CREATE_SUPPORT_TICKET = gql`
  mutation CreateSupportTicket($data: CreateSupportTicketInput!) {
    createSupportTicket(data: $data) {
      id
      category
      message
      status
      createdAt
    }
  }
`;

export const RESPOND_TO_TICKET = gql`
  mutation RespondToTicket($data: RespondToTicketInput!) {
    respondToTicket(data: $data) {
      id
      response
      status
      respondedBy
      respondedAt
    }
  }
`;
