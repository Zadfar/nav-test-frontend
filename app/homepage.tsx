import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  RefreshControl, ListRenderItem, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getCustomers } from '../services/api';
import { Customer } from '../types';

export default function HomePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      alert("Failed to load data");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderItem: ListRenderItem<Customer> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.accountLabel}>Account:</Text>
        <Text style={styles.accountValue}>{item.account_number}</Text>
      </View>
      
      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Issue Date:</Text>
        <Text style={styles.value}>{new Date(item.issue_date).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Interest Rate:</Text>
        <Text style={styles.value}>{item.interest_rate}%</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tenure:</Text>
        <Text style={styles.value}>{item.tenure} Months</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>EMI Due Amount</Text>
        <Text style={styles.totalValue}>${item.emi_due}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.webCenterWrapper}>
          <View style={styles.container}>
            <FlatList
              data={customers}
              keyExtractor={(item) => item.account_number}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No loans found.</Text>}
            />
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => router.push("/payment")}
              >
                <Text style={styles.payButtonText}>Make a Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  listContent: { padding: 15, paddingBottom: 100 }, 
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 15,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  accountLabel: { fontSize: 14, color: '#666' },
  accountValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '500', color: '#333' },
  totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#d32f2f' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
  },
  payButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});