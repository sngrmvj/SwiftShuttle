import React, {useState,useEffect} from 'react';
import MapView, {Marker,Image} from 'react-native-maps';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from "axios"; 


export default function App() {

  const data = [
    { label: 'Manyata Entrance'},
    { label: 'Target(Opp Dockyard)'},
    { label: 'Escape(Opp CTS)'},
    { label: 'Nokia'},
    { label: 'IBM'},
    { label: 'Rolls Royce(Opp Nokia)'},
  ];

  const [value, setValue] = useState([]);
  const GET_LOCATION_URL = "http://127.0.0.1:9999/get_estimate/"
  const currentRegion = {
    latitude: 13.046008,
    longitude: 77.619710,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }
  const [mapRegion, setMapRegion] = useState();

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy:true})
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      // latitudeDelta: 0.0922,
      // longitudeDelta: 0.0421
    });
  }


  useEffect(() => {
    userLocation();
  }, [mapRegion]);
  


  const getData =(selectedItem) =>{
    let resultArray = [];
    axios.get(`${GET_LOCATION_URL}?bus_stop=${selectedItem}`)
    .then(result=>{      
      
      const new_result = result.data
      if (Object.keys(new_result).length > 0){
        for (const key in new_result) {
          const distance = new_result[key]['distance'];
          const time = new_result[key]['time'];
          let busInfo = <View><Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus - {key}</Text> <Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus Stop - {selectedItem}</Text> <Text style={{fontSize:15, fontWeight:"bold"}}>Distance - {distance} | Time - {time}</Text></View>;
          resultArray.push(busInfo);
        }
      } else {
        let distance = "562m";
        let time = "2min";
        let key = "2";
        let busInfo = <View><Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus - {key}</Text> <Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus Stop - {selectedItem}</Text> <Text style={{fontSize:15, fontWeight:"bold"}}>Distance - {distance} | Time - {time}</Text></View>;
        resultArray.push(busInfo);
      }
      setValue(resultArray);
    }).catch((error) => {
      if( error.response ){
          console.log(error.response.data); // => the response payload 
      }
    })
  }



  return (
    <View style={styles.container}>
      <View>
        <MapView style={styles.map} region={currentRegion}>
          <Marker coordinate={{latitude:13.043339,longitude:77.6210554}} title='Manyata shuttle stop (Philips)'/>
          <Marker coordinate={{latitude:13.0469848,longitude:77.6209442}} title='Target(Opp Dockyard)'/>
          <Marker coordinate={{latitude:13.050317,longitude:77.621865}} title='Escape(Opp CTS)' />
          <Marker coordinate={{latitude:13.050625,longitude:77.620225}} title='Nokia' />
          <Marker coordinate={{latitude:13.049221,longitude:77.619526}} title='IBM D4' />
          <Marker coordinate={{latitude:13.046008, longitude:77.619710}} title='Rolls Royce(Opp Nokia)' />
          <Marker coordinate={mapRegion} title='Current Location' />
        </MapView>
      </View>
      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          // maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          searchPlaceholder="Search..."
          value={value}
          onChange={item => {
            getData(item.label);
          }}
          renderLeftIcon={() => (
            <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
          )}
        />
        </View>
        <View style= {styles.sub_container}>
          <Text>
            {
              value.length === 0 ? <Text style={{color:"white"}}>
                <Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus - 2 {"\n"}</Text> 
                <Text style={{fontSize:15, fontWeight:"bold", marginBottom:5}}>Bus Stop - IBM D4 {"\n"}</Text> 
                <Text style={{fontSize:15, fontWeight:"bold"}}>Distance - 562m | Time - 2min</Text>
              </Text>: <Text></Text>
            }
          </Text>

          <Text>
            {
              value.map((Language) => (
                <Text key={Language} style={{color:"white"}}>{Language} {"\n"}</Text>
              ))
            }
          </Text>
        </View>
    </View>
    
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '80%'
  },
  image: {
    width: 35,
    height: 35
  },
  sub_container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -65,
    padding: 10,
    backgroundColor: '#009688',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  dropdown: {
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    padding:10,
    marginTop: -125,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

