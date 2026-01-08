import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/indexSimple';
import { View, Text, StyleSheet } from 'react-native';

const AppTest = () => {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Text style={styles.text}>Veyara App - Redux Test</Text>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AppTest;
