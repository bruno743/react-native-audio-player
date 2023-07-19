import { StyleSheet, Text, View, StatusBar } from 'react-native';
import React from 'react';
import Colors from '../misc/Colors';

const Screens = ({children}) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

export default Screens;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.APP_BG,
        paddingTop: StatusBar.currentHeight,
    },
});