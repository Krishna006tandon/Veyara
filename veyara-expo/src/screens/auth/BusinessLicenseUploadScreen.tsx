import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type StoreAuthStackParamList = {
  StoreLogin: undefined;
  BusinessLicenseUpload: undefined;
  VerificationStatus: { status: string };
};

type BusinessLicenseUploadScreenNavigationProp = NativeStackNavigationProp<StoreAuthStackParamList, 'BusinessLicenseUpload'>;

interface DocumentResult {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
}

const BusinessLicenseUploadScreen = () => {
  const navigation = useNavigation<BusinessLicenseUploadScreenNavigationProp>();
  const [selectedDocument, setSelectedDocument] = useState<DocumentResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedDocument({
          uri: asset.uri,
          name: asset.fileName || `license_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedDocument) {
      Alert.alert('Error', 'Please select a business license document');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to verification status
      navigation.replace('VerificationStatus', { status: 'in_progress' });
    } catch (error) {
      Alert.alert('Upload Failed', 'Unable to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.uploadCard}>
        <View style={styles.headerSection}>
          <Ionicons name="business" size={48} color="#739EC9" />
          <Text style={styles.title}>Business License Verification</Text>
          <Text style={styles.subtitle}>
            Upload your valid business license to verify your store
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.dropZone, selectedDocument && styles.dropZoneSelected]}
          onPress={pickDocument}
          disabled={isUploading}
        >
          {selectedDocument ? (
            <View style={styles.selectedDocument}>
              <Ionicons name="document-text" size={40} color="#739EC9" />
              <Text style={styles.documentName}>{selectedDocument.name}</Text>
              <Text style={styles.documentSize}>{formatFileSize(selectedDocument.size)}</Text>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={pickDocument}
                disabled={isUploading}
              >
                <Text style={styles.changeButtonText}>Change Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.dropZoneContent}>
              <Ionicons name="cloud-upload" size={48} color="#739EC9" />
              <Text style={styles.dropZoneText}>Tap to upload business license</Text>
              <Text style={styles.dropZoneSubtext}>
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={16} color="#739EC9" />
            <Text style={styles.requirementText}>Valid business license document</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={16} color="#739EC9" />
            <Text style={styles.requirementText}>Clear and readable document</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={16} color="#739EC9" />
            <Text style={styles.requirementText}>Not expired or revoked</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, (!selectedDocument || isUploading) && styles.buttonDisabled]}
          onPress={handleUpload}
          disabled={!selectedDocument || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload for Verification</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isUploading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8DB',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  uploadCard: {
    backgroundColor: '#5682B1',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: '#739EC9',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    backgroundColor: 'rgba(115, 158, 201, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  dropZoneSelected: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(115, 158, 201, 0.2)',
  },
  dropZoneContent: {
    alignItems: 'center',
  },
  dropZoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#739EC9',
    marginTop: 10,
    textAlign: 'center',
  },
  dropZoneSubtext: {
    fontSize: 14,
    color: '#739EC9',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.8,
  },
  selectedDocument: {
    alignItems: 'center',
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 10,
    textAlign: 'center',
  },
  documentSize: {
    fontSize: 14,
    color: '#000000',
    marginTop: 5,
    opacity: 0.7,
  },
  changeButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#739EC9',
    borderRadius: 5,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  requirementsSection: {
    marginVertical: 25,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#5682B1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#739EC9',
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: '#000000',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#739EC9',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default BusinessLicenseUploadScreen;
