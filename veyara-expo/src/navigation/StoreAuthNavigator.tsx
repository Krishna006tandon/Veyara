import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreLoginScreen from '../screens/auth/StoreLoginScreen';
import BusinessLicenseUploadScreen from '../screens/auth/BusinessLicenseUploadScreen';
import VerificationStatusScreen from '../screens/auth/VerificationStatusScreen';
import StoreDashboardScreen from '../screens/store/StoreDashboardScreen';

const Stack = createNativeStackNavigator();

type StoreAuthStackParamList = {
  StoreLogin: undefined;
  BusinessLicenseUpload: undefined;
  VerificationStatus: { status: string };
  StoreDashboard: undefined;
};

const StoreAuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="StoreLogin"
    >
      <Stack.Screen name="StoreLogin" component={StoreLoginScreen} />
      <Stack.Screen name="BusinessLicenseUpload" component={BusinessLicenseUploadScreen} />
      <Stack.Screen name="VerificationStatus" component={VerificationStatusScreen} />
      <Stack.Screen name="StoreDashboard" component={StoreDashboardScreen} />
    </Stack.Navigator>
  );
};

export default StoreAuthNavigator;
