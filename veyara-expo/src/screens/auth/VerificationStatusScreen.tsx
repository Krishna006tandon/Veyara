import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type StoreAuthStackParamList = {
  StoreLogin: undefined;
  BusinessLicenseUpload: undefined;
  VerificationStatus: { status: string };
  StoreDashboard: undefined;
};

type VerificationStatusScreenNavigationProp = NativeStackNavigationProp<StoreAuthStackParamList, 'VerificationStatus'>;
type VerificationStatusRouteProp = RouteProp<StoreAuthStackParamList, 'VerificationStatus'>;

interface VerificationData {
  status: 'in_progress' | 'approved' | 'rejected' | 'needs_review';
  confidence?: number;
  details?: string;
  extractedData?: {
    businessName?: string;
    licenseNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
  };
}

const VerificationStatusScreen = () => {
  const navigation = useNavigation<VerificationStatusScreenNavigationProp>();
  const route = useRoute<VerificationStatusRouteProp>();
  const [verificationData, setVerificationData] = useState<VerificationData>({
    status: route.params.status as any,
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (route.params.status === 'in_progress') {
      // Simulate checking verification status
      const checkStatus = async () => {
        setIsCheckingStatus(true);
        
        // Simulate API call to check verification status
        setTimeout(() => {
          // For demo purposes, randomly determine the outcome
          const outcomes: Array<'approved' | 'rejected' | 'needs_review'> = ['approved', 'rejected', 'needs_review'];
          const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
          
          setVerificationData({
            status: randomOutcome,
            confidence: randomOutcome === 'approved' ? 0.95 : randomOutcome === 'rejected' ? 0.15 : 0.60,
            details: randomOutcome === 'approved' 
              ? 'Your business license has been successfully verified and approved.'
              : randomOutcome === 'rejected'
              ? 'The uploaded document could not be verified. Please ensure you uploaded a valid business license.'
              : 'Your document requires manual review by our verification team.',
            extractedData: randomOutcome !== 'rejected' ? {
              businessName: 'Sample Business Name',
              licenseNumber: 'BL-2024-123456',
              issueDate: '2024-01-15',
              expiryDate: '2025-01-14',
              issuingAuthority: 'Department of Business Licensing'
            } : undefined
          });
          setIsCheckingStatus(false);
        }, 3000);
      };

      checkStatus();
    }
  }, [route.params.status]);

  const getStatusContent = () => {
    switch (verificationData.status) {
      case 'in_progress':
        return {
          icon: 'time-outline',
          iconColor: '#739EC9',
          title: 'Verification in Progress',
          subtitle: 'We are analyzing your business license',
          message: 'This usually takes 30-60 seconds. Please wait while our AI system verifies your document.',
          backgroundColor: '#FFE8DB',
          cardColor: '#5682B1',
        };
      
      case 'approved':
        return {
          icon: 'checkmark-circle',
          iconColor: '#739EC9',
          title: 'Verification Approved',
          subtitle: 'Your business license is verified',
          message: 'Congratulations! Your store has been approved and you now have full access to all features.',
          backgroundColor: '#FFE8DB',
          cardColor: '#5682B1',
        };
      
      case 'rejected':
        return {
          icon: 'close-circle',
          iconColor: '#5682B1',
          title: 'Verification Failed',
          subtitle: 'Unable to verify your document',
          message: 'The uploaded document could not be verified. Please upload a clear and valid business license.',
          backgroundColor: '#FFE8DB',
          cardColor: '#5682B1',
        };
      
      case 'needs_review':
        return {
          icon: 'help-circle',
          iconColor: '#739EC9',
          title: 'Manual Review Required',
          subtitle: 'Your document needs human verification',
          message: 'Our team will manually review your document within 24 hours. You will receive a notification once the review is complete.',
          backgroundColor: '#FFE8DB',
          cardColor: '#5682B1',
        };
      
      default:
        return {
          icon: 'alert-circle',
          iconColor: '#739EC9',
          title: 'Unknown Status',
          subtitle: 'Please contact support',
          message: 'An unexpected error occurred. Please contact our support team for assistance.',
          backgroundColor: '#FFE8DB',
          cardColor: '#5682B1',
        };
    }
  };

  const statusContent = getStatusContent();

  const handleProceed = () => {
    if (verificationData.status === 'approved') {
      navigation.replace('StoreDashboard');
    } else if (verificationData.status === 'rejected') {
      navigation.replace('BusinessLicenseUpload');
    }
    // For needs_review, stay on this screen and wait
  };

  const renderExtractedData = () => {
    if (!verificationData.extractedData) return null;

    return (
      <View style={styles.extractedDataSection}>
        <Text style={styles.extractedDataTitle}>Extracted Information:</Text>
        {verificationData.extractedData.businessName && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Business Name:</Text>
            <Text style={styles.dataValue}>{verificationData.extractedData.businessName}</Text>
          </View>
        )}
        {verificationData.extractedData.licenseNumber && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>License Number:</Text>
            <Text style={styles.dataValue}>{verificationData.extractedData.licenseNumber}</Text>
          </View>
        )}
        {verificationData.extractedData.issueDate && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Issue Date:</Text>
            <Text style={styles.dataValue}>{verificationData.extractedData.issueDate}</Text>
          </View>
        )}
        {verificationData.extractedData.expiryDate && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Expiry Date:</Text>
            <Text style={styles.dataValue}>{verificationData.extractedData.expiryDate}</Text>
          </View>
        )}
        {verificationData.extractedData.issuingAuthority && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Issuing Authority:</Text>
            <Text style={styles.dataValue}>{verificationData.extractedData.issuingAuthority}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: statusContent.backgroundColor }]}>
      <View style={[styles.statusCard, { backgroundColor: statusContent.cardColor }]}>
        <View style={styles.iconSection}>
          {verificationData.status === 'in_progress' && isCheckingStatus ? (
            <ActivityIndicator size={48} color={statusContent.iconColor} />
          ) : (
            <Ionicons name={statusContent.icon as any} size={48} color={statusContent.iconColor} />
          )}
        </View>

        <Text style={styles.title}>{statusContent.title}</Text>
        <Text style={styles.subtitle}>{statusContent.subtitle}</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{statusContent.message}</Text>
        </View>

        {verificationData.confidence !== undefined && (
          <View style={styles.confidenceSection}>
            <Text style={styles.confidenceLabel}>Verification Confidence:</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${verificationData.confidence * 100}%`,
                    backgroundColor: verificationData.confidence > 0.7 ? '#739EC9' : '#5682B1'
                  }
                ]} 
              />
            </View>
            <Text style={styles.confidenceValue}>{Math.round(verificationData.confidence * 100)}%</Text>
          </View>
        )}

        {renderExtractedData()}

        {verificationData.details && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Details:</Text>
            <Text style={styles.detailsText}>{verificationData.details}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          {verificationData.status === 'approved' && (
            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
              <Text style={styles.proceedButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          )}
          
          {verificationData.status === 'rejected' && (
            <TouchableOpacity style={styles.retryButton} onPress={handleProceed}>
              <Text style={styles.retryButtonText}>Re-upload Document</Text>
            </TouchableOpacity>
          )}
          
          {verificationData.status === 'needs_review' && (
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    margin: 20,
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  messageContainer: {
    backgroundColor: 'rgba(115, 158, 201, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  confidenceSection: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '600',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
    fontWeight: '600',
  },
  extractedDataSection: {
    backgroundColor: 'rgba(115, 158, 201, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  extractedDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailsSection: {
    backgroundColor: 'rgba(115, 158, 201, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 20,
  },
  proceedButton: {
    backgroundColor: '#739EC9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#5682B1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#739EC9',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#739EC9',
  },
  contactButtonText: {
    color: '#739EC9',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationStatusScreen;
