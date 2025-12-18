import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { StackActions } from '@react-navigation/native';
import { submitPayment, getCustomerDetails } from '../services/api'; 

export default function PaymentScreen() {
  //const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ account: string; due: string }>();
  
  const [accountNumber, setAccountNumber] = useState<string>(params.account || '');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchedDue, setFetchedDue] = useState<string>('0.00');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- STEP 1: VALIDATION LOGIC ---
  const handleInitialSubmit = async () => {
    // 1. Basic Input Validation
    if (!accountNumber || !amount) {
      showAlert("Error", "Please fill all fields");
      return;
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      showAlert("Error", "Please enter a valid positive amount");
      return;
    }

    setLoading(true);
    try {
      // 2. Fetch Fresh Data (Check if Account Exists)
      const customer = await getCustomerDetails(accountNumber);

      if (!customer) {
        setLoading(false);
        showAlert("Invalid Account", "The account number you entered does not exist.");
        return;
      }

      const currentDue = parseFloat(customer.emi_due);

      // 3. Check if Amount Exceeds Due
      // Note: You might want to allow slight overpayment in some apps, 
      // but based on your request, we block it here.
      if (payAmount > currentDue) {
        setLoading(false);
        showAlert(
          "Amount Exceeded", 
          `You cannot pay more than the EMI due amount ($${currentDue}).`
        );
        return;
      }

      // 4. Success - Store the real due amount and show confirmation
      setFetchedDue(customer.emi_due);
      setLoading(false);
      setShowConfirmModal(true);

    } catch (error) {
      setLoading(false);
      showAlert("Network Error", "Could not verify account details. Please try again.");
    }
  };

  const processFinalPayment = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      await submitPayment(accountNumber, amount);
      setShowSuccessModal(true);
    } catch (error) {
      const msg = "Payment failed. Please try again.";
      showAlert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigation.dispatch(StackActions.popToTop());
  };

  // Helper for Web/Mobile alerts
  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.webCenterWrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Payment Form */}
              <View style={styles.formSection}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter Account Number"
                  editable={!params.account}
                />
                <Text style={styles.label}>Payment Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Enter Amount"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.payButton, loading && styles.disabledButton]}
                onPress={handleInitialSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay ${amount || '0'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {/* --- MODAL 1: CONFIRMATION --- */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showConfirmModal}
              onRequestClose={() => setShowConfirmModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Confirm Payment</Text>
          
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Current EMI Due:</Text>
                    <Text style={styles.infoValue}>${fetchedDue}</Text>
                  </View>
                  <Text style={styles.modalText}>
                    Are you sure you want to pay <Text style={{fontWeight: 'bold'}}>${amount}</Text> to account <Text style={{fontWeight: 'bold'}}>{accountNumber}</Text>?
                  </Text>
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setShowConfirmModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={processFinalPayment}
                    >
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* --- MODAL 2: SUCCESS --- */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={showSuccessModal}
              onRequestClose={handleCloseSuccess}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                  <Text style={styles.modalTitle}>Payment Successful!</Text>
                  <Text style={styles.modalText}>Transaction completed.</Text>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.fullWidthButton]}
                    onPress={handleCloseSuccess}
                  >
                    <Text style={styles.confirmButtonText}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webCenterWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600, 
    alignSelf: 'center', 
    backgroundColor: '#f5f5f5', // Inner app background
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
    } : {})
  },

  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  formSection: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '500', color: '#333' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16 },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  payButton: { backgroundColor: '#2E7D32', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  disabledButton: { backgroundColor: '#A5D6A7' },
  payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  modalText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#e0e0e0', flex: 1, marginRight: 10 },
  confirmButton: { backgroundColor: '#1976D2', flex: 1, marginLeft: 10 },
  fullWidthButton: { backgroundColor: '#1976D2', width: '100%' },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  iconCircle: { width: 60, height: 60, backgroundColor: '#E8F5E9', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkmark: { color: '#2E7D32', fontSize: 30, fontWeight: 'bold' },
  infoBox: { backgroundColor: '#f9f9f9', width: '100%', padding: 15, borderRadius: 8, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  infoLabel: { fontSize: 16, color: '#666' },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f' },
});