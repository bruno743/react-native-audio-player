import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useContext, useEffect } from 'react';
import Screens from '../components/Screens';
import Colors from '../misc/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import PlayerButton from '../components/PlayerButton';
import { AudioContext } from '../context/AudioProvider';
import { pause, resume, selectAudio, changeAudio } from '../misc/AudioController'
import { convertTime } from '../misc/Helper';

const {width} = Dimensions.get('window');

const Player = () => {
  const context = useContext(AudioContext);

  const {playbackPosition, playbackDuration} = context;

  // progresso da musica no slider
  const calculateSeekBar = () => {
    if(playbackPosition !== null && playbackDuration !== null){
      return playbackPosition / playbackDuration;
    }
    return 0;
  }

  // metodo para recuperar audio selecionado antes de fechar o app
  useEffect(() => {
    context.loadPreviousAudio();
  }, []);

  const handlePlayPause = async () => {
    await selectAudio(context.currentAudio, context);
  }

  const handleNext = async () => {
    await changeAudio(context, 'next');
  }

  const handlePrev = async () => {
    await changeAudio(context, 'prev');
  }

  // calcula o momento atual do audio
  const renderCurrentTime = () => {
    return convertTime(context.playbackPosition / 1000);
  }

  if(!context.currentAudio) return null;

  return (
    <Screens>
      <View style={styles.container}>
        <Text style={styles.audioCount}>{`${context.currentAudioIndex+1}/${context.totalAudioCount}`}</Text>
        <View style={styles.midBannerContainer}>
          <MaterialCommunityIcons
            name='music-circle'
            size={300}
            color={context.isPlaying ? Colors.ITEM_COLOR : Colors.ACTIVE_BG}
          />
        </View>
        <View style={styles.audioPlayerContainer}>
          <Text numberOfLines={1} style={styles.audioTitle}>{context.currentAudio.filename.toString().slice(0, -4)}</Text>
          <View style={{justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 12}}>
            <Text>{context.playbackPosition<1000 ? '00:00' : renderCurrentTime()}</Text>
            <Text>{convertTime(context.currentAudio.duration)}</Text>
          </View>
          <Slider
            style={{width: width, height:40}}
            minimumValue={0}
            maximumValue={1}
            value={calculateSeekBar()}
            minimumTrackTintColor={Colors.ITEM_COLOR}
            maximumTrackTintColor={Colors.ACTIVE_BG}
            onSlidingStart={
              async () => {
                if(!context.isPlaying) return;

                try {
                  await pause(context.playbackObj);
                } catch (error) {
                  console.log('Error (onSlidingStart): ', error.message);
                }
              }
            }
            onSlidingComplete={
              async (value) => {
                if(context.soundObj === null) return;

                try {
                  const status = await context.playbackObj.setPositionAsync(
                    Math.floor(context.soundObj.durationMillis * value)
                  );
                  context.updateState(context, {
                    soundObj: status,
                    playbackPosition: status.positionMillis,
                  });
                  await resume(context.playbackObj);
                } catch (error) {
                  console.log('Error (onSlidingComplete): ', error.message);
                }
              }
            }
          />
          <View style={styles.audioControllers}>
            <PlayerButton onPress={handlePrev} iconType='PREV' />
            <PlayerButton
              onPress={handlePlayPause}
              style={{marginHorizontal: 20}}
              iconType={context.isPlaying ? 'PLAY' : 'PAUSE'} />
            <PlayerButton onPress={handleNext} iconType='NEXT' />
          </View>
        </View>
      </View>
    </Screens>
  );
};

export default Player;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    audioCount: {
      textAlign: 'right',
      padding: 15,
      color: Colors.APP_BG,
      fontSize: 14,
    },
    midBannerContainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioPlayerContainer: {},
    audioTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.ACTIVE_BG,
      padding: 15,
      alignSelf: 'center',
    },
    audioControllers: {
      width: width,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 25,
    },
});