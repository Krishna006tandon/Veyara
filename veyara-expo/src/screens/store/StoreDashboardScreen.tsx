import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StoreData {
  name: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  ordersCount: number;
  earnings: number;
}

const StoreDashboardScreen = () => {
  const [storeData, setStoreData] = useState<StoreData>({
    name: 'Your Store',
    verificationStatus: 'pending',
    ordersCount: 0,
    earnings: 0,
  });
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const isVerified = storeData.verificationStatus === 'approved';

  const handleRestrictedAction = (action: string) => {
    if (!isVerified) {
      setShowRestrictedModal(true);
      return;
    }
    // Handle the action if verified
    Alert.alert('Action', `${action} would be performed here`);
  };

  const RestrictedModal = () => (
    <Modal
      visible={showRestrictedModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRestrictedModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="lock-closed" size={32} color="#739EC9" />
            <Text style={styles.modalTitle}>Access Restricted</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            This feature requires business license verification. Please complete the verification process to access all store features.
          </Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowRestrictedModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with verification status */}
      <View style={[styles.header, { backgroundColor: isVerified ? '#5682B1' : '#000000' }]}>
        <View style={styles.headerContent}>
          <Text style={styles.storeName}>{storeData.name}</Text>
          <View style={styles.verificationBadge}>
            <Ionicons 
              name={isVerified ? 'checkmark-circle' : 'time-outline'} 
              size={16} 
              color={isVerified ? '#739EC9' : '#739EC9'} 
            />
            <Text style={styles.verificationText}>
              {isVerified ? 'Verified' : 'Verification Required'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#5682B1' }]}>
          <Ionicons name="cart-outline" size={24} color="#739EC9" />
          <Text style={styles.statNumber}>{storeData.ordersCount}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#5682B1' }]}>
          <Ionicons name="wallet-outline" size={24} color="#739EC9" />
          <Text style={styles.statNumber}>${storeData.earnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      {/* Action Cards */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Store Management</Text>
        
        <TouchableOpacity 
          style={[styles.actionCard, !isVerified && styles.restrictedCard]}
          onPress={() => handleRestrictedAction('Order Management')}
        >
          <View style={styles.actionContent}>
            <Ionicons name="list-outline" size={24} color="#739EC9" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Order Management</Text>
              <Text style={styles.actionSubtitle}>
                {isVerified ? 'View and manage orders' : 'Requires verification'}
              </Text>
            </View>
          </View>
          {!isVerified && (
            <View style={styles.restrictedBadge}>
              <Ionicons name="lock-closed" size={16} color="#5682B1" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, !isVerified && styles.restrictedCard]}
          onPress={() => handleRestrictedAction('Packaging')}
        >
          <View style={styles.actionContent}>
            <Ionicons name="cube-outline" size={24} color="#739EC9" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Packaging</Text>
              <Text style={styles.actionSubtitle}>
                {isVerified ? 'Manage packaging settings' : 'Requires verification'}
              </Text>
            </View>
          </View>
          {!isVerified && (
            <View style={styles.restrictedBadge}>
              <Ionicons name="lock-closed" size={16} color="#5682B1" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, !isVerified && styles.restrictedCard]}
          onPress={() => handleRestrictedAction('Earnings')}
        >
          <View style={styles.actionContent}>
            <Ionicons name="cash-outline" size={24} color="#739EC9" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Earnings</Text>
              <Text style={styles.actionSubtitle}>
                {isVerified ? 'View earnings and payouts' : 'Requires verification'}
              </Text>
            </View>
          </View>
          {!isVerified && (
            <View style={styles.restrictedBadge}>
              <Ionicons name="lock-closed" size={16} color="#5682B1" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Available Actions (always accessible) */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Store Settings</Text>
        
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Ionicons name="settings-outline" size={24} color="#739EC9" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Store Settings</Text>
              <Text style={styles.actionSubtitle}>Manage store information</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Ionicons name="document-text-outline" size={24} color="#739EC9" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Business Documents</Text>
              <Text style={styles.actionSubtitle}>View uploaded documents</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <RestrictedModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8DB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(115, 158, 201, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verificationText: {
    fontSize: 12,
    color: '#739EC9',
    marginLeft: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.7,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: '#5682B1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restrictedCard: {
    opacity: 0.7,
    backgroundColor: '#000000',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#000000',
    opacity: 0.7,
    marginTop: 2,
  },
  restrictedBadge: {
    backgroundColor: '#5682B1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#5682B1',
    borderRadius: 15,
    padding: 24,
    maxWidth: 320,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#739EC9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StoreDashboardScreen;
