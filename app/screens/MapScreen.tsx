import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Accuracy, LocationObject } from 'expo-location';
import { Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/rootReducer';
import { PositionActions } from '../store/positionReducer';

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Store
  const { destination } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);
  const { orientationToFollow } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();

  useEffect(() => {
    if (position == null)
      return;
    //TODO: take into account the radius of the earth
    const dLon = destination.longitude - position.longitude;
    const dLat = destination.latitude - position.latitude;
    const lat2 = destination.latitude;
    const lat1 = position.latitude
    //var y = Math.sin(dLon) * Math.cos(lat2);
    //var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);


    //let y = position.longitude * destination.latitude - position.latitude * destination.longitude
    //let x = position.longitude * destination.longitude + position.latitude * destination.latitude;
    //var deg = Math.atan2(y, x) * 180 / Math.PI;

    let deg = Math.asin(dLat / (Math.sqrt(dLat * dLat + dLon * dLon)));
    var res = dLon >= 0 ? deg : (Math.PI) - deg;
    res = res * 180 / Math.PI;

    res = (res + 360) % 360;

    //var deg = Math.atan2(destination.longitude - position.longitude, destination.latitude - position.latitude) * 180 / Math.PI;

    positionDispatch({ type: 'SET_ORIENTATION_TO_FOLLOW', payload: res });
  }, [position, destination]);

  useEffect(() => {
    (async () => {
      console.log("Init MapScreen stuff");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      positionDispatch({ type: 'SET_POSITION', payload: location.coords });
      setRegion({ ...region, latitude: location.coords.latitude, longitude: location.coords.longitude })

      Location.watchPositionAsync({ accuracy: Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 }, location => {
        positionDispatch({ type: 'SET_POSITION', payload: location.coords });
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.mapStyle} initialRegion={region} onPress={(e) => positionDispatch({ type: 'SET_DESTINATION', payload: e.nativeEvent.coordinate })} >
        {!position ? null :
          <Marker
            key={1}
            coordinate={position}
            title="Position"
          />
        }
        {!destination ? null :
          <Marker
            key={2}
            coordinate={destination}
            title="Destination"
          />
        }
      </MapView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
