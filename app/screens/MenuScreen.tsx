import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { Magnetometer, ThreeAxisMeasurement } from 'expo-sensors';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, ThemedButton, View } from '../components/Themed';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/rootReducer';
import { PositionActions } from '../store/positionReducer';
import places from '../constants/Places';
import { ParcoursService } from '../services/parcours.service';
import { Ionicons } from '@expo/vector-icons';
import { Coord } from '../constants/Maths';

export default function MenuScreen({ navigation }: { navigation: any /* TODO: find type */ }) {

  // Store
  const { destination } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);
  const { parcours } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();

  function setRandomParcours() {
    navigation.navigate('Map');
  }

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

  function setRandomDestination() {
    const parisPlaces = places.paris;
    const index = Math.floor(Math.random() * Object.keys(parisPlaces).length);
    const randomPlace = parisPlaces[index];
    positionDispatch({ type: 'SET_DESTINATION', payload: randomPlace.position });

    generateParcours(randomPlace.position);
    navigation.navigate('Direction');
  }

  return (
    <View style={styles.container}>
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons size={150} style={{}} name="paper-plane-outline" />
      </View>
      <View style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <ThemedButton
          onPress={setRandomParcours}
          title="Where are we going ?"
          accessibilityLabel="Learn more about this purple button"
          style={{ marginBottom: 30, width: 250 }}
          color="primary"
        />
        <ThemedButton
          onPress={setRandomDestination}
          title="Just wander"
          accessibilityLabel="Learn more about this purple button"
          style={{ marginBottom: 20, width: 250 }}
        />
      </View >
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
