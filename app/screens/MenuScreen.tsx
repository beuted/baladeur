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

export default function MenuScreen() {

  // Store
  const { destination } = useSelector((state: AppState) => state.position);
  const { position } = useSelector((state: AppState) => state.position);

  // Actions
  const positionDispatch = useDispatch<React.Dispatch<PositionActions>>();

  function setRandomDestination() {
    const parisPlaces = places.paris;
    const index = Math.floor(Math.random() * parisPlaces.length);
    const randomPlace = parisPlaces[index];
    alert("Next destination: " + randomPlace.name);

    positionDispatch({ type: 'SET_DESTINATION', payload: randomPlace.position });
    positionDispatch({ type: 'SET_PARCOURS', payload: [randomPlace] });
  }

  function setRandomParcours() {
    let placeIndexes = ParcoursService.generateParcours(position, destination);
    if (!placeIndexes || placeIndexes.length == 0) {
      alert("Unable to generate a parcours for you, try another destination.");
      return;
    }
    let choosenPlaces = placeIndexes.map(x => places.paris[x])
    positionDispatch({ type: 'SET_PARCOURS', payload: choosenPlaces });
    alert("Parcours generated with " + choosenPlaces.length + " points of interest on your way.");
  }

  return (
    <View style={styles.container}>
      <ThemedButton
        onPress={setRandomDestination}
        title="Find interesting spot in my area"
        accessibilityLabel="Learn more about this purple button"
      />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ThemedButton
        onPress={setRandomParcours}
        title="Find me a parcours to my destination"
        accessibilityLabel="Learn more about this purple button"
      />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

    </View >
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
