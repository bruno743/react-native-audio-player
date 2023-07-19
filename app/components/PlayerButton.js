import React from 'react';
import {AntDesign} from '@expo/vector-icons';
import Colors from '../misc/Colors'

// renderiza os botoes de controle de audio (play, pause, next, previous)
const PlayerButton = (props) => {
  const {iconType, size = 40, color = Colors.MAIN_TEXT, onPress} = props;
  const getIconName = (type) => {
    switch (type) {
        case 'PLAY':
            return 'pausecircleo';
        case 'PAUSE':
            return 'playcircleo';
        case 'NEXT':
            return 'stepforward';
        case 'PREV':
            return 'stepbackward';
    
        default:
            break;
    }
  }
  return (
    <AntDesign onPress={onPress} name={getIconName(iconType)} size={size} color={color} {...props} />
  );
};

export default PlayerButton;
