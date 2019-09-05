import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, Button} from 'react-native-elements';
import CustomRadio from "./Components/CustomRadio"
import AllLinesContext from '../../allLinesContext';

const CardSettings = ({...props}) => {
  const {setModalVisible, visible} = props;
  const {allVehicles, setAllVehicles} = useContext(AllLinesContext);
  
  const toggle = () => {
      setAllVehicles(!allVehicles)
  }
  return (
    <Card
      containerStyle={cardContainer}
      wrapperStyle={cardWrapperStyle}
      title="Settings">
       <View style={styles.body}>
        <CustomRadio value={allVehicles} toggle={toggle} instruction={"Show only vehicules from myLines"}/>
      </View>
      <View style={styles.button}>
        <Button
          raised
          title="Close"
          onPress={() => setModalVisible(!visible)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        // backgroundColor: 'white',
    },
    button: {
        justifyContent: 'flex-end',
    },
});

const cardWrapperStyle = {
  borderWidth: 0,
  flex: 1,
};

const cardContainer = {
  // backgroundColor: 'black',
  flex: 1,
  height: '100%',
  flexDirection: 'column',
  borderWidth: 0, // Remove Border
  shadowColor: 'rgba(0,0,0, 0.0)', // Remove Shadow IOS
  shadowOffset: {height: 0, width: 0},
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0, // This is for Android
};

export default CardSettings;
