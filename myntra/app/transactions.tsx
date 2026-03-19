import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/themeContext';
import { Download, ChevronLeft, Calendar, ReceiptText, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// We will build export logic using expo-print shortly
import { exportStatement, exportReceipt } from '../utils/exportUtils';
import { LOCAL_API, REMOTE_API } from "@/constants/api";
import axios from 'axios';
import { useAuth } from "@/context/AuthContext";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type TransactionStatus = 'Success' | 'Failed' | 'Refunded';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  mode: string;
  status: TransactionStatus;
  type: 'Online' | 'COD' | 'Refund';
}

const FILTER_OPTIONS = ['All', 'Online', 'COD', 'Refunds'];

export default function TransactionsScreen() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          const res = await axios.get(`${REMOTE_API}/Order/transactions/export/${user._id}`);
          setTransactions(res.data);
        } catch (error) {
          console.log('Error fetching transactions', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const exportCSV = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${REMOTE_API}/Order/transactions/export/${user._id}?format=csv`);
      const csvData = res.data;
      const fileUri = FileSystem.documentDirectory + "transactions.csv";
      await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Download Transactions CSV' });
    } catch (err) {
      console.log('Failed to export CSV', err);
    }
  };

  const filteredData = useMemo(() => {
    if (activeFilter === 'All') return transactions;
    if (activeFilter === 'Refunds') return transactions.filter(t => t.type === 'Refund');
    return transactions.filter(t => t.type === activeFilter);
  }, [transactions, activeFilter]);

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'Success': return '#4CAF50';
      case 'Failed': return '#F44336';
      case 'Refunded': return '#FF9800';
      default: return theme.text;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.amount);
    const formattedDate = new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.txnId, { color: theme.text }]}>{item.id}</Text>
            <Text style={[styles.txnDate, { color: theme.textSecondary }]}>{formattedDate}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: theme.text }]}>{formattedAmount}</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
               <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.mode, { color: theme.textSecondary }]}>Via {item.mode}</Text>
          {item.status === 'Success' && (
            <TouchableOpacity 
              style={styles.receiptButton}
              onPress={() => exportReceipt(item)}
            >
              <Download size={14} color={theme.primary} />
              <Text style={[styles.receiptText, { color: theme.primary }]}>Receipt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Transactions</Text>
        <View style={styles.headerActions}>
           <TouchableOpacity onPress={() => exportCSV()} style={styles.actionIcon}>
             <FileText size={22} color={theme.primary} />
           </TouchableOpacity>
           <TouchableOpacity onPress={() => exportStatement(filteredData)} style={styles.actionIcon}>
             <Download size={24} color={theme.primary} />
           </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { 
                  backgroundColor: activeFilter === item ? theme.primary : theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[
                styles.filterText, 
                { color: activeFilter === item ? '#fff' : theme.textSecondary }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Fetching transactions...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.centerContainer}>
           <ReceiptText size={64} color={theme.border} />
           <Text style={[styles.emptyTitle, { color: theme.text }]}>No Transactions Found</Text>
           <Text style={[styles.emptySub, { color: theme.textSecondary }]}>You haven't made any {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} transactions yet.</Text>
           <TouchableOpacity 
             style={[styles.shopButton, { backgroundColor: theme.primary }]}
             onPress={() => router.push('/')}
            >
             <Text style={styles.shopButtonText}>Continue Shopping</Text>
           </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { marginLeft: 16 },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: { fontSize: 14, fontWeight: '500' },
  listContainer: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  txnId: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  txnDate: { fontSize: 12 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mode: { fontSize: 14 },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptText: { fontSize: 14, fontWeight: '500' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
