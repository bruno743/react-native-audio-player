import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { Entypo } from '@expo/vector-icons';
import Colors from '../misc/Colors';

const getFirstChar = (text) => text[0];

// converte o tempo obtido do objeto de milisegundos para minutos
const convertTime = (time) => {
    const minutes = time / 60;
    const absMinutes = minutes.toString().split('.')[0];
    const fracMinutes = parseInt(minutes.toString().split('.')[1].slice(0, 2));
    const sec = Math.ceil((60 * fracMinutes) / 100);

    if(parseInt(absMinutes) < 10 && sec < 10){
        return `0${absMinutes}:0${sec}`;
    }

    if(parseInt(absMinutes) < 10){
        return `0${absMinutes}:${sec}`;
    }

    if(sec < 10){
        return `${absMinutes}:0${sec}`;
    }

    return `${absMinutes}:${sec}`;
};

// na lista de audios, mostra o estado do audio selecionado
const renderPlayPauseIcon = (isPlaying) => {
    if(isPlaying){
        return (<Entypo name='controller-paus' size={24} color={Colors.APP_BG} />)
    }

    return (<Entypo name='controller-play' size={24} color={Colors.APP_BG} />)
}

const AudioListItem = ({title, duration, onAudioPress, isPlaying, activeItem}) => {
  return (
    <>
    <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onAudioPress}>
            <View style={styles.left}>
                <View style={[styles.thumbnail, {
                        backgroundColor: activeItem ? Colors.ACTIVE_BG: Colors.ITEM_COLOR
                        }]}
                >
                    <Text style={styles.thumbnailText}>
                        {activeItem ? renderPlayPauseIcon(isPlaying) : getFirstChar(title)}
                    </Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text numberOfLines={1} style={styles.title}>{title}</Text>
                    <Text style={styles.time}>{convertTime(duration)}</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
        
    </View>
    <View style={styles.separator} />
    </>
  );
};

export default AudioListItem;

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: width - 80,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    thumbnail: {
        height: 50,
        flexBasis: 50,
        backgroundColor: Colors.APP_BG,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    thumbnailText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.MAIN_TEXT,
    },
    titleContainer: {
        width: width - 180,
        paddingLeft: 10,
    },
    title: {
        fontSize: 16,
        color: Colors.MAIN_TEXT,
    },
    separator: {
        width: width - 80,
        backgroundColor: '#333',
        opacity: 0.3,
        heigth: 0.5,
        alignSelf: 'center',
        marginTop: 10,
    },
    time: {
        fontSize: 14,
        color: Colors.ITEM_COLOR,
    },
});