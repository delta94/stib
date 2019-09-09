/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useState, useEffect, useRef, useInterval} from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Dimensions,
  Text,
} from 'react-native';

import Geojson from 'react-native-geojson';
import {FloatingAction} from 'react-native-floating-action';
import ModalAdd from './Components/Modal/ModalAdd';
import ModalSettings from './Components/Modal/ModalSettings';

import {AllLinesProvider} from './allLinesContext';
import map from './assets/map';
import allStops from './assets/info/stops';
import lines from './assets/info/lines';
import MapBox from './Components/MapBox/MapBox';
import MapBoxAnimated from './Components/MapBox/MapBoxAnimated';
import Toast, {DURATION} from 'react-native-easy-toast';

const App = () => {
  const [marginBottom, setMarginBottom] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSettings, setModalSettings] = useState(false);
  const [mainPressed, setMainPressed] = useState(false);
  const [allLines, setAllLines] = useState();
  const [myLines, setMyLines] = useState([]);

  //Need this for setInterval
  const allLinesRef = useRef(allLines);
  allLinesRef.current = allLines;
  const myLinesRef = useRef(myLines);
  myLinesRef.current = myLines;

  const [geoJson, setGeoJson] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const [vehiculesGeoJson, setVehiculesGeoJson] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const [myVehiculesGeoJson, setMyVehiculesGeoJson] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const toast = useRef(null);
  //Settings
  const [allVehicles, setAllVehicles] = useState(false);
  const [showStopName, setShowStopName] = useState(false);

  useEffect(() => {
    setAllLines(map.initLines(allStops));
  }, []);

  // useEffect(() => {
  //   updateAllVehicleGeoJson(allLinesRef.current, myLinesRef.current);
  //   setInterval(() => {
  //     updateAllVehicleGeoJson(allLinesRef.current, myLinesRef.current);
  //   }, 1000 * 35);
  // }, [allLines]);

  const addLine = selectedLine => {
    if (
      !myLines.find(
        line =>
          line.selection.nroStop === selectedLine.nroStop &&
          line.selection.variantStop === selectedLine.variantStop,
      )
    ) {
      map.addToMyLines(selectedLine).then(response => {
        setMyLines([...myLines, response.newLine]);
        addLineToGeoJson(response.newLine);
        editVehiclesGeoJson(selectedLine, 'add');
      });
      toast.current.show('line Added', 2000);
    } else toast.current.show("Line already stored in 'myLines'", 2000);
  };

  const editVehiclesGeoJson = (line, action) => {
    let newFeatures = vehiculesGeoJson.features;
    if (action === 'add') {
      vehiculesGeoJson.features.map((vehicle, i) => {
        if (
          vehicle.properties.numero_lig === line.nroStop &&
          vehicle.properties.variante === line.variantStop
        ) {
          newFeatures[i].properties.myLine = 1;
        }
      });
    } else {
      vehiculesGeoJson.features.map((vehicle, i) => {
        if (
          vehicle.properties.numero_lig === line.selection.nroStop &&
          vehicle.properties.variante === line.selection.variantStop
        ) {
          newFeatures[i].properties.myLine = 0;
        }
      });
    }

    setVehiculesGeoJson({
      ...vehiculesGeoJson,
      features: newFeatures,
    });
  };

  const deleteLine = lineTodelete => {
    deleteLineFromGeoJson(lineTodelete);
    editVehiclesGeoJson(lineTodelete, 'delete');
    setMyLines([
      ...myLines.filter((line, i) => myLines.indexOf(lineTodelete) !== i),
    ]);
  };

  const addLineToGeoJson = line => {
    setGeoJson({
      ...geoJson,
      features: [
        ...geoJson.features,
        ...line.line.shape.features,
        ...line.line.stops,
      ],
    });
  };

  const addVehiculesToGeoJson = features => {
    setVehiculesGeoJson({
      ...vehiculesGeoJson,
      features,
    });
  };

  const deleteStopsFromGeoJson = lineTodelete => {
    setGeoJson({
      ...geoJson,
      features: [
        ...geoJson.features.filter(
          (feature, i) =>
            geoJson.features.indexOf(line.line.shape.features[0]) !== i,
        ),
      ],
    });
  };

  const updateAllVehicleGeoJson = async (allLines, myLines) => {
    if (allLines) {
      let responses = await map.updateAllVehicles(
        chunkArray(
          allLines
            .map(line => line.nroStop)
            .filter((x, i, arr) => arr.indexOf(x) === i),
          10,
        ),
      );

      Promise.all(responses).then(features => {
        //add "myLine=1" property if vahicule exists in myLines
        let concatenatedFeatures = features.reduce((a, b) => {
          return a.concat(b);
        });
        concatenatedFeatures.map((vehicle, i) => {
          myLines.map(line => {
            if (
              vehicle.properties.numero_lig === line.selection.nroStop &&
              vehicle.properties.variante === line.selection.variantStop &&
              vehicle.properties.mode === line.selection.mode[0]
            ) {
              concatenatedFeatures[i].properties.myLine = 1;
            }
          });
        });

        setVehiculesGeoJson({
          ...vehiculesGeoJson,
          features: concatenatedFeatures,
        });
      });
    }
  };

  const chunkArray = (myArray, chunk_size) => {
    var results = [];

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }

    return results;
  };

  const deleteLineFromGeoJson = line => {
    let newfeatures = geoJson.features.filter(
      feature => line.line.stops.indexOf(feature) === -1,
    );
    newfeatures = newfeatures.filter(
      feature => line.line.shape.features.indexOf(feature) === -1,
    );

    setGeoJson({
      ...geoJson,
      features: [...newfeatures],
    });
  };

  const actions = [
    {
      text: 'Add Line',
      icon: {
        uri: 'https://www.flaticon.com/premium-icon/icons/svg/201/201531.svg',
      },
      name: 'addLine',
      position: 1,
    },
    {
      text: 'Settings',
      icon: {
        uri: 'https://www.flaticon.com/premium-icon/icons/svg/201/201531.svg',
      },
      name: 'settings',
      position: 1,
    },
    {
      text: 'About',
      icon: {
        uri: 'https://www.flaticon.com/premium-icon/icons/svg/205/205577.svg',
      },
      name: 'about',
      position: 2,
    },
  ];

  console.log(vehiculesGeoJson);
  return (
    <AllLinesProvider
      value={{
        allLines,
        myLines,
        deleteLine,
        addLine,
        allVehicles,
        setAllVehicles,
        showStopName,
        setShowStopName,
      }}>
      <Fragment>
        <View
          style={{
            width: '100%',
            height: '100%',
          }}>
          {/* <MapBox
            myLines={myLines}
            geoJson={geoJson}
            vehiculesGeoJson={vehiculesGeoJson}
            allStops={allStops}
            mapFunctions={map}
          /> */}
          {/* <MapBoxAnimated /> */}
        </View>
        <FloatingAction
          actions={actions}
          overlayColor={'rgba(0, 0, 0, 0)'}
          onPressMain={() => setMainPressed(!mainPressed)}
          onPressBackdrop={() => setMainPressed(false)}
          onPressItem={name => {
            if (name === 'addLine') {
              setMainPressed(false);
              setModalVisible(true);
            } else if (name === 'settings') {
              setModalSettings(true);
            }
          }}
        />
        <ModalAdd visible={modalVisible} setModalVisible={setModalVisible} />
        <ModalSettings
          modalSettings={modalSettings}
          setModalSettings={setModalSettings}
        />
        <Toast position="bottom" ref={toast} />
      </Fragment>
    </AllLinesProvider>
  );
};

export default App;
