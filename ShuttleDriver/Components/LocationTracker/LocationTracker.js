import React, { useState, useEffect } from 'react';
import { View, TouchableHighlight, StyleSheet, Dimensions, Text, Switch } from 'react-native';
import * as Location from 'expo-location';
import axios from "axios"; 



const LocationTracker = () => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);



    const postCoordinates = (latitude, longitude) => {
        const POST_LOCATION_URL = "http://127.0.0.1:9999/location/"  
        var data = {
            latitude: latitude,
            longitude: longitude
        }

        const options = {
            withCredentials: true,
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                'Content-Type': 'application/json',
            },
            data : data
        };

        axios.put(`${POST_LOCATION_URL}?bus_id=1`, options)
        .then(result=>{
            console.log(result.status)    
        }).catch(error => {
            console.error(error.error);
        })
    }


    const sendCoordinates = async () => {
        try{
            
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                conaole.error(`The error is - ${status}`)
                setErrorMsg('Permission to access location was denied');
                console.error('Permission to access location was denied');
                return null;
            }
    
            let position = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = position.coords;
            postCoordinates(latitude, longitude);

        } catch (error){
            console.error(error);
        }
    };
    
    // hasLocationPermission = async () => {
    //     if (Platform.OS === 'android') {

    //         try {
    //             const granted = await PermissionsAndroid.request(
    //                 PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    //                 {
    //                     title: 'Require access to your location',
    //                     message:
    //                     'We can track the location of bus your location',
    //                     buttonNeutral: 'Ask Me Later',
    //                     buttonNegative: 'Cancel',
    //                     buttonPositive: 'OK',
    //                 },
    //             );
    //             if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //                 console.log('You can use the camera');
    //             } else {
    //                 console.log('Camera permission denied');
    //             }
    //         } catch (err) {
    //             console.warn(err);
    //         }
    //     } else {
    //         return false;
    //     }

    // }

    useEffect(() => {
        let interval;

        if (isSending) {
            interval = setInterval(sendCoordinates, 10000); // Call sendCoordinates every 10 seconds
        }
        
        return () => {
            clearInterval(interval); // Clear the interval when the component unmounts
        };
    }, [isSending]);

    const toggleSending = () => {
        setIsSending(prevState => !prevState);
        toggleSwitch();
    };

    return (
        <View style={styles.container}>

            <View style={{ flex:1, flexDirection:"row"}}>
                <Text style={{fontSize:18, fontWeight:"bold", padding: 5, paddingRight:25, color:"#009688"}}>Location</Text>
                <Switch style={styles.switch}
                    trackColor={{false: '#767577', true: '#a9f5ee'}}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>

            <View style={styles.sub_container}>
                <TouchableHighlight onPress={toggleSending}>
                    <View style={styles.buttons}>
                        <Text style={[styles.submitButtons]}>{isSending ? 'Stop sharing location' : 'Start sharing location'}</Text>
                    </View>
                </TouchableHighlight>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('window').width,
        flex: 1,
        alignItems: 'center',
        // backgroundColor: '#F5FCFF',
        paddingHorizontal: 12
    },
    sub_container: {
        width: Dimensions.get('window').width,
        position: 'absolute',
        bottom:40,
        left:0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16
    },
    buttons: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#009688',
        borderWidth: 2
    },
    submitButtons: {
        color: '#009688',
        textAlign:"center",
        fontWeight: "bold",
        fontSize: 18,
    },
    switch:{
        height: 30,
        alignItems: 'flex-end'
    }  
});


export default LocationTracker;



