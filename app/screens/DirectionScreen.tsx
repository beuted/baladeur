import { Ionicons } from '@expo/vector-icons';
import { Accelerometer, Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { LPF } from '../services/lpf-modulus';
import { PositionActions } from '../store/positionReducer';
import { AppState } from '../store/rootReducer';

// LPF
const lpf = new LPF(0.5);

export default function DirectionScreen() {

  const [angle, setAngle] = useState(0);
  const [directionToFollowPlusNorth, setDirectionToFollowPlusNorth] = useState(0);
  const [distance, setDistance] = useState(0);
  const [accelerometer, setAccelerometer] = useState<ThreeAxisMeasurement | null>(null);
  const [magnetometer, setMagnetometer] = useState<ThreeAxisMeasurement | null>(null);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  // Store
  const { orientationToFollow } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);
  const { destination } = useSelector((state: AppState) => state.position);
  const { parcours } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();


  useEffect(() => {
    //TODO unsubscribe https://github.com/rahulhaque/compass-react-native-expo/blob/master/App.js
    Magnetometer.addListener((data) => {
      //setAngle(getAngle(data));
      setX(Math.floor(data.x));
      setY(Math.floor(data.y));
      setZ(Math.floor(data.z));
      setMagnetometer(data);
    })
    Accelerometer.addListener(accelerometerData => {
      setAccelerometer(accelerometerData);
    })
  }, [])

  useEffect(() => {
    //TODO unsubscribe https://github.com/rahulhaque/compass-react-native-expo/blob/master/App.js
    var angle = onSensorChanged(accelerometer, magnetometer);
    setAngle(angle);
  }, [accelerometer, magnetometer])

  useEffect(() => {
    let directionToFollowPlusNorth = Math.round(-orientationToFollow - angle + 90 - 45);
    let newDirLpfAndModulus = lpf.nextModulus((directionToFollowPlusNorth + 360) % 360, 360);
    setDirectionToFollowPlusNorth(newDirLpfAndModulus);
  }, [angle, orientationToFollow])

  useEffect(() => {
    setDistance(measure(position, destination));
  }, [position, destination])

  useEffect(() => {
    if (!parcours || parcours.length == 0 || !position) {
      return;
    }

    var distance = measure(position, parcours[0].position);
    if (distance < 10) { // Si on est à moins de 10m
      alert(`You reached: \n${parcours[0].name} \n${parcours[0].description} \n(${parcours[0].position.longitude}, ${parcours[0].position.latitude})`);

      positionDispatch({ type: 'POP_LAST_POINT_PARCOURS', payload: null });
    }
  }, [position, parcours])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getDirection((-orientationToFollow + 90 + 360) % 360)}</Text>
      <Text>{distance} m</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Ionicons size={90} style={{ marginBottom: -3, transform: [{ rotate: directionToFollowPlusNorth + 'deg' }] }} name="paper-plane-outline" />
    </View>
  );
}

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

// Old method to get the angle without looking at the accelerometer
const getAngle = (magnetometer: ThreeAxisMeasurement) => {
  let { x, y, z } = magnetometer;

  var angle: number;
  if (Math.atan2(y, x) >= 0) {
    angle = Math.atan2(y, x) * (180 / Math.PI);
  } else {
    angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
  }

  return lpf.next(angle);
};

function onSensorChanged(accelerometer: ThreeAxisMeasurement | null, magnetometer: ThreeAxisMeasurement | null) {
  // Source of this black magic: https://stackoverflow.com/questions/32372847/android-algorithms-for-sensormanager-getrotationmatrix-and-sensormanager-getori
  if (!accelerometer || !magnetometer)
    return 0;


  let Hx = magnetometer.y * accelerometer.z - magnetometer.z * accelerometer.y;
  let Hy = magnetometer.z * accelerometer.x - magnetometer.x * accelerometer.z;
  let Hz = magnetometer.x * accelerometer.y - magnetometer.y * accelerometer.x;
  let normH = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);

  let invH = 1.0 / normH;
  Hx *= invH;
  Hy *= invH;
  Hz *= invH;
  let invA = 1.0 / Math.sqrt(accelerometer.x * accelerometer.x + accelerometer.y * accelerometer.y + accelerometer.z * accelerometer.z);
  let Ax = accelerometer.x *= invA;
  let Ay = accelerometer.y *= invA;
  let Az = accelerometer.z *= invA;


  /*
  R[0] = Hx;     R[1] = Hy;     R[2] = Hz;
  R[3] = Mx;     R[4] = My;     R[5] = Mz;
  R[6] = Ax;     R[7] = Ay;     R[8] = Az;
  */

  let Mx = Ay * Hz - Az * Hy;
  let My = Az * Hx - Ax * Hz;
  let Mz = Ax * Hy - Ay * Hx;

  let azimuth = Math.atan2(Hy, My);
  let pitch = Math.asin(-Ay);
  let roll = Math.atan2(-Ax, Az);

  return (azimuth * (180 / Math.PI) + 360) % 360 as number;
}

function measure(position: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number }) {  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = destination.latitude * Math.PI / 180 - position.latitude * Math.PI / 180;
  var dLon = destination.longitude * Math.PI / 180 - position.longitude * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(position.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.round(d * 1000); // meters
}
