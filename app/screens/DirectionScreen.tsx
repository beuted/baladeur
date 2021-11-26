import { Ionicons } from '@expo/vector-icons';
import { Accelerometer, Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Image, Modal, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, ThemedButton, View } from '../components/Themed';
import { Coord } from '../constants/Maths';
import { LPF } from '../services/lpf-modulus';
import { PositionActions } from '../store/positionReducer';
import { AppState } from '../store/rootReducer';

// LPF
const lpf = new LPF(0.5);

export default function DirectionScreen() {

  const [angle, setAngle] = useState(0);
  const [directionToFollowPlusNorth, setDirectionToFollowPlusNorth] = useState(0);
  const [distance, setDistance] = useState(-1);
  const [accelerometer, setAccelerometer] = useState<ThreeAxisMeasurement | null>(null);
  const [magnetometer, setMagnetometer] = useState<ThreeAxisMeasurement | null>(null);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const [orientationToFollow, setOrientationToFollow] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState<{ title: string, description: string | null, picture: any | null }>({
    title: "Passage Rochebrune et la Cité Dupont",
    description: "Le passage Rochebrune est une petite rue secrète nichée au cœur du 11e arrondissement. Vous y trouverez de ravissants petits cafés, une culture street-art assez prononcée, et un calme rappelant les villages de notre campagne française",
    picture: require('../assets/images/Cite-Dupont-Balade.jpg')
  });


  // Store
  const { position } = useSelector((state: AppState) => state.position);
  const { destination } = useSelector((state: AppState) => state.position);
  const { parcours } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();

  // Setup the update of both magnetormeter and accelerometer
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

  // Update the orentation to follow
  useEffect(() => {
    if (!position)
      return;
    let dest: Coord;
    if (!parcours || parcours.length == 0) {
      dest = destination;
    } else {
      dest = parcours[0].position;
    }
    //TODO: take into account the radius of the earth
    const dLon = dest.longitude - position.longitude;
    const dLat = dest.latitude - position.latitude;
    const lat2 = dest.latitude;
    const lat1 = position.latitude
    //var y = Math.sin(dLon) * Math.cos(lat2);
    //var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);


    //let y = position.longitude * dest.latitude - position.latitude * dest.longitude
    //let x = position.longitude * dest.longitude + position.latitude * dest.latitude;
    //var deg = Math.atan2(y, x) * 180 / Math.PI;

    let deg = Math.asin(dLat / (Math.sqrt(dLat * dLat + dLon * dLon)));
    var res = dLon >= 0 ? deg : (Math.PI) - deg;
    res = res * 180 / Math.PI;

    res = (res + 360) % 360;

    //var deg = Math.atan2(dest.longitude - position.longitude, dest.latitude - position.latitude) * 180 / Math.PI;

    setOrientationToFollow(res);
  }, [position, destination, parcours]);

  // Update the angle based on black matric magic
  useEffect(() => {
    var angle = onSensorChanged(accelerometer, magnetometer);
    setAngle(angle);
  }, [accelerometer, magnetometer])

  // Update the direction of the arrow
  useEffect(() => {
    let directionToFollowPlusNorth = Math.round(-orientationToFollow - angle + 90 - 45);
    let newDirLpfAndModulus = lpf.nextModulus((directionToFollowPlusNorth + 360) % 360, 360);
    setDirectionToFollowPlusNorth(newDirLpfAndModulus);
  }, [angle, orientationToFollow])

  // Update the distance
  useEffect(() => {
    if (!parcours || parcours.length == 0 || !position) {
      return;
    }

    setDistance(measure(position, parcours[0].position));
  }, [position, parcours])

  // Show modal if we're close
  useEffect(() => {
    // distance init to -1 at first to avoid showing the modal directly
    if (distance > 0 && distance < 10) { // Si on est à moins de 10m
      setModalInfo({
        title: parcours[0].name,
        description: parcours[0].description,
        picture: parcours[0].picture
      });
      setModalVisible(true);
      positionDispatch({ type: 'SET_KNOWN_PLACE', payload: parcours[0].id });
      positionDispatch({ type: 'POP_LAST_POINT_PARCOURS', payload: null });
    }
  }, [distance])

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.container}>
          <View style={styles.modalView}>
            <Text style={styles.title}>{modalInfo.title}</Text>
            <Image style={styles.modalImage} source={modalInfo.picture} />
            <Text style={styles.modalText}>{modalInfo.description}</Text>
            <ThemedButton
              onPress={() => setModalVisible(!modalVisible)}
              title="Ok "
              accessibilityLabel="Close modal"
            />
          </View>
        </View>
      </Modal>

      <Text style={styles.orientation}>{getDirection((-orientationToFollow + 90 + 360) % 360)}</Text>
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
  orientation: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
  },
  modalImage: {
    marginTop: 20,
    marginBottom: 20,
    width: 300,
    height: 300
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
