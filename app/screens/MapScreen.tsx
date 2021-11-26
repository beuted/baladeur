import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import MapView, { LatLng, MapEvent, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Accuracy, LocationObject } from 'expo-location';
import { Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/rootReducer';
import { PositionActions } from '../store/positionReducer';
import { Coord } from '../constants/Maths';
import places from '../constants/Places';
import { ParcoursService } from '../services/parcours.service';

export default function MapScreen({ navigation }: { navigation: any /* TODO: find type */ }) {
  const [region, setRegion] = useState<Region>({
    latitude: 48.85610244323937,
    longitude: 2.34,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.16,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Store
  const { destination } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);
  const { parcours } = useSelector((state: AppState) => state.position);
  const { knownPlaces } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();

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

  function generateParcours(dest?: Coord) {
    let placeIndexes = ParcoursService.generateParcours(position, dest || destination);
    if (!placeIndexes || placeIndexes.length == 0) {
      alert("Unable to generate a parcours for you, try another destination.");
      return;
    }
    let choosenPlaces = placeIndexes.map(x => places.paris[x])
    positionDispatch({ type: 'SET_PARCOURS', payload: choosenPlaces });
    //alert("Parcours generated with " + choosenPlaces.length + " points of interest on your way.");
  }

  function clickOnMap(e: MapEvent) {
    positionDispatch({ type: 'SET_DESTINATION', payload: e.nativeEvent.coordinate });
    generateParcours(e.nativeEvent.coordinate);
    navigation.navigate('Direction');
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.mapStyle} initialRegion={region} onPress={(e) => clickOnMap(e)} >
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
        {
          knownPlaces.map((id, i) => {
            return (<Marker
              key={3 + i}
              coordinate={places.paris[id].position}
              title={places.paris[id].name}
              pinColor="#FF00FF"
            />)
          })
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
