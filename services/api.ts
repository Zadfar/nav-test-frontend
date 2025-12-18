import axios from 'axios';
import { Customer, PaymentResponse } from '../types';

// REPLACE with your local IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await axios.get<Customer[]>(`${API_URL}/customers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getCustomerDetails = async (accountNumber: string): Promise<Customer | undefined> => {
  try {
    const allCustomers = await getCustomers();
    return allCustomers.find(c => c.account_number === accountNumber);
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw error;
  }
};

export const submitPayment = async (accountNumber: string, amount: string): Promise<PaymentResponse> => {
  try {
    const response = await axios.post<PaymentResponse>(`${API_URL}/payments`, {
      account_number: accountNumber,
      amount: parseFloat(amount),
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting payment:", error);
    throw error;
  }
};
