import React, { useState, useEffect } from 'react';
import { View, TouchableHighlight, StyleSheet, Dimensions, Text, Switch, Platform } from 'react-native';


const Header = () => {
    return(
        <View style={{ overflow: 'hidden', paddingBottom: 5 }}>
            <View style={styles.container}>
                <Text style={{color: "white", fontWeight:"bold", fontSize:25, marginBottom: -10, marginTop: 10}}>SwiftShuttle Partner</Text>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container:{
        borderRadius: 30,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        padding: 50,
        backgroundColor: "#009688",
        marginBottom: 10,
        top: -30,
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    }
})


export default Header;