import React, {useEffect, Fragment, useRef, useContext, useState} from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Dimensions,
  Text,
} from 'react-native';

import AllLinesContext from '../../allLinesContext';

import stopIcon from '../../assets/img/stop.png';
import tramIcon from '../../assets/img/tram.png';
import busIcon from '../../assets/img/bus.png';
import metroIcon from '../../assets/img/metro.png';

const MapBox = ({...props}) => {
  const {
    myLines,
    geoJson,
    vehiculesGeoJson,
    myVehiculesGeoJson,
    allStops,
    mapFunctions,
  } = props;
  const {addLine, allVehicles} = useContext(AllLinesContext);
  const [permissions, setPermissions] = useState(false);

  const mapBox = useRef(null);

  useEffect(() => {
    setPermissions(getPermissions());
  }, []);

  const getPermissions = async () => {
    console.log(await MapboxGL.requestAndroidLocationPermissions());
  };

  MapboxGL.setAccessToken(
    'pk.eyJ1IjoiZnNlYmFzdGUiLCJhIjoiY2p6ejh1YTFjMDRzcjNpcnhoN2gyMnBsMSJ9.JXvFU4bITL0RqMNQuaPizg',
  );

  const iconStyles = {
    stops: {
      iconImage: stopIcon,
      iconAllowOverlap: true,
      iconSize: 0.1,
    },
    vehicules: {
      tram: {
        iconImage: tramIcon,
        iconAllowOverlap: true,
      },
      metro: {
        iconImage: metroIcon,
        iconAllowOverlap: true,
      },
      bus: {
        iconImage: busIcon,
        iconAllowOverlap: true,
      },
    },
  };

  const showData = vehicule => {
    let stopShape = getStopShape(vehicule);
    let selection = {
      nroStop: stopShape.properties.numero_lig,
      variantStop: stopShape.properties.variante,
      direction: stopShape.properties.terminus,
      nroLine: mapFunctions.setVariantLine(
        stopShape.properties.numero_lig,
        stopShape.properties.mode,
      ),
      variantLine: stopShape.properties.variante === '1' ? 901 : 902,
      mode:
        stopShape.properties.mode === 'B'
          ? 'Bus'
          : stopShape.properties.mode === 'T'
          ? 'Tram'
          : stopShape.properties.mode === 'M'
          ? 'Metro'
          : null,
      icon:
        stopShape.properties.mode === 'B'
          ? mapFunctions.icons.bus
          : stopShape.properties.mode === 'T'
          ? mapFunctions.icons.tram
          : stopShape.properties.mode === 'M'
          ? mapFunctions.icons.metro
          : mapFunctions.icons.bus,
    };
    addLine(selection);
  };

  const getStopShape = ({mode, numero_lig, variante}) => {
    return allStops.features.find(
      stop =>
        stop.properties.numero_lig === numero_lig &&
        stop.properties.variante === variante,
    );
  };

  console.log(vehiculesGeoJson, myVehiculesGeoJson);

  return (
    permissions && (
      <View style={{flex: 1}}>
        <MapboxGL.MapView
          ref={mapBox}
          compassEnabled={true}
          styleURL={MapboxGL.StyleURL.Light}
          style={styles.map}
          userTrackingMode={1}
          showUserLocation={true}
          pitchEnabled={true}>
          <MapboxGL.Camera
            zoomLevel={30}
            followUserMode={'normal'}
            followUserLocation={true}
          />
          {myLines.length > 0 ? (
            <Fragment>
              <MapboxGL.ShapeSource id="myLines" shape={geoJson}>
                <MapboxGL.LineLayer
                  // key={i}
                  belowLayerID={'myTrams'}
                  id="lines"
                  style={{
                    lineColor: ['get', 'COLOR_HEX'],
                    lineWidth: 5,
                  }}
                />
                <MapboxGL.SymbolLayer
                  belowLayerID={'myTrams'}
                  layerIndex={2}
                  id="symbolLocationSymbols"
                  minZoomLevel={12}
                  style={iconStyles.stops}
                />
                <MapboxGL.Callout title="This is a sample" />
              </MapboxGL.ShapeSource>
            </Fragment>
          ) : null}
          {!allVehicles ? (
            <Fragment>
              <MapboxGL.ShapeSource
                id="tram"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={myVehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  id="myTrams"
                  filter={[
                    'all',
                    ['==', ['get', 'mode'], 'T'],
                    ['==', ['get', 'myLine'], 1],
                  ]}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.tram}
                />
              </MapboxGL.ShapeSource>
              <MapboxGL.ShapeSource
                id="metro"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={myVehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  aboveLayerID={'myTrams'}
                  id="myMetros"
                  filter={[
                    'all',
                    ['==', ['get', 'mode'], 'M'],
                    ['==', ['get', 'myLine'], 1],
                  ]}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.metro}
                />
              </MapboxGL.ShapeSource>
              <MapboxGL.ShapeSource
                id="bus"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={myVehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  aboveLayerID={'myTrams'}
                  id="myBus"
                  filter={[
                    'all',
                    ['==', ['get', 'mode'], 'B'],
                    ['==', ['get', 'myLine'], 1],
                  ]}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.bus}
                />
              </MapboxGL.ShapeSource>
            </Fragment>
          ) : (
            <Fragment>
              <MapboxGL.ShapeSource
                id="tram"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={vehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  id="myTrams"
                  filter={['==', ['get', 'mode'], 'T']}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.tram}
                />
              </MapboxGL.ShapeSource>
              <MapboxGL.ShapeSource
                id="metro"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={vehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  aboveLayerID={'myTrams'}
                  id="myMetros"
                  filter={['==', ['get', 'mode'], 'M']}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.metro}
                />
              </MapboxGL.ShapeSource>
              <MapboxGL.ShapeSource
                id="bus"
                onPress={({nativeEvent}) =>
                  showData(nativeEvent.payload.properties)
                }
                shape={vehiculesGeoJson}>
                <MapboxGL.SymbolLayer
                  aboveLayerID={'myTrams'}
                  id="myBus"
                  filter={['==', ['get', 'mode'], 'B']}
                  minZoomLevel={10}
                  style={iconStyles.vehicules.bus}
                />
              </MapboxGL.ShapeSource>
            </Fragment>
          )}
          <MapboxGL.UserLocation />
        </MapboxGL.MapView>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  map: {
    justifyContent: 'center',
    position: 'absolute',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
});

export default MapBox;
