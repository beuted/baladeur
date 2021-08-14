import { Ionicons } from '@expo/vector-icons';
import { Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { AppState } from '../store/rootReducer';

export default function DirectionScreen() {

  const [magnetometer, setMagnetometer] = useState(0);
  const [directionToFollowPlusNorth, setDirectionToFollowPlusNorth] = useState(0);
  const [distance, setDistance] = useState(0);

  // Store
  const { orientationToFollow } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);
  const { destination } = useSelector((state: AppState) => state.position);


  useEffect(() => {
    //TODO unsubscribe https://github.com/rahulhaque/compass-react-native-expo/blob/master/App.js
    Magnetometer.addListener((data) => {
      setMagnetometer(getAngle(data));
    })
  }, [])

  useEffect(() => {
    setDirectionToFollowPlusNorth(orientationToFollow - magnetometer + 90)
  }, [magnetometer, orientationToFollow])

  useEffect(() => {
    setDistance(Math.floor(measure(position, destination)));
  }, [position, destination])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getDirection((orientationToFollow + 360) % 360)}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text>{distance} m</Text>
      <Ionicons size={30} style={{ marginBottom: -3, transform: [{ rotate: directionToFollowPlusNorth + 'deg' }] }} name="arrow-up" />
    </View>
  );
}
/*       <Image
        style={styles.arrow}
        source={require('@expo/images/adaptive-icon.png')}
      /> */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  arrow: {
    width: 50,
    height: 50,
  },
});

const getAngle = (magnetometer: ThreeAxisMeasurement) => {
  let { x, y, z } = magnetometer;

  var angle: number;
  if (Math.atan2(y, x) >= 0) {
    angle = Math.atan2(y, x) * (180 / Math.PI);
  } else {
    angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
  }

  return Math.round(angle);
};

const getDirection = (degree: number) => {
  if (degree >= 22.5 && degree < 67.5) {
    return 'NE';
  }
  else if (degree >= 67.5 && degree < 112.5) {
    return 'E';
  }
  else if (degree >= 112.5 && degree < 157.5) {
    return 'SE';
  }
  else if (degree >= 157.5 && degree < 202.5) {
    return 'S';
  }
  else if (degree >= 202.5 && degree < 247.5) {
    return 'SW';
  }
  else if (degree >= 247.5 && degree < 292.5) {
    return 'W';
  }
  else if (degree >= 292.5 && degree < 337.5) {
    return 'NW';
  }
  else {
    return 'N';
  }
};

function measure(position: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number }) {  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = destination.latitude * Math.PI / 180 - position.latitude * Math.PI / 180;
  var dLon = destination.longitude * Math.PI / 180 - position.longitude * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(position.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}
