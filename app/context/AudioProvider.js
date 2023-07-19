import { Text, View, StyleSheet, Alert } from 'react-native';
import React, { Component, createContext } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { DataProvider } from 'recyclerlistview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { playNext } from '../misc/AudioController';
import { storeAudioForNextOpen } from '../misc/Helper';

export const AudioContext = createContext();

export class AudioProvider extends Component {
    constructor(props){
        super(props);
        this.state = {
            audioFiles: [],
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1!==r2),
            playbackObj: null,
            soundObj: null,
            currentAudio: {},
            isPlaying: false,
            currentAudioIndex: null,
            playbackPosition: null,
            playbackDuration: null,
        };
        this.totalAudioCount = 0;
    }

    // alerta de permissao
    permissionAlert = () => {
        Alert.alert(
            'Permissão Necessária.',
            'Este aplicativo precisa ler arquivos de áudio.',
            [
                {
                    text: 'OK',
                    onPress: () => this.getPermission(),
                },
                {
                    text: 'Cancelar',
                    onPress: () => this.permissionAlert(),
                },
            ]);
    }

    // obtem os audios no dispositivo
    getAudioFiles = async () => {
        const {dataProvider, audioFiles} = this.state;
        let media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
        });

        media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: media.totalCount,
        });

        this.totalAudioCount = media.totalCount;

        this.setState({
            ...this.state,
            dataProvider: dataProvider.cloneWithRows([...audioFiles, ...media.assets]),
            audioFiles: [...audioFiles, ...media.assets]
        })
    }

    // recupera o ultimo audio selecionado antes de o aplicativo ser fechado
    loadPreviousAudio = async () => {
        let previousAduio = await AsyncStorage.getItem('previousAudio');
        let currentAudio;
        let currentAudioIndex;
        
        if(previousAduio === null){
            currentAudio = this.state.audioFiles[0];
            currentAudioIndex = 0;
        }else {
            previousAduio = JSON.parse(previousAduio);
            currentAudio = previousAduio.audio;
            currentAudioIndex = previousAduio.index;
        }

        this.setState({...this.state, currentAudio, currentAudioIndex});
    }
    
    // obtendo permissao para acesso aos arquivos
    getPermission = async () => {
         /*{
            "canAskAgain": true,
            "expires": "never",
            "granted": false,
            "status": "undetermined",
        } */
        const permission = await MediaLibrary.getPermissionsAsync();

        // permissao concedida
        if(permission.granted){
            this.getAudioFiles();
        }

        // permissao negada e nao pergunte novamente acionado
        if(!permission.canAskAgain && !permission.granted){
            this.setState({...this.state, permissionError: true});
        }

        // permissao negada e possivel perrguntar novamente
        if(!permission.granted && permission.canAskAgain){
            const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
            if(status === 'denied' && canAskAgain){
                this.permissionAlert();
            }

            if(status === 'granted'){
                this.getAudioFiles();
            }

            if(status === 'denied' && !canAskAgain){
                this.setState({...this.state, permissionError: true});
            }
        }
    }

    // atualizando status do audio, definindo qual o audio selecionado, qual o seu estado e posicao(tempo)
    onPlaybackStatusUpdate = async playbackStatus => {
        // momento do audio
        if(playbackStatus.isLoaded && playbackStatus.isPlaying){
          this.updateState(this, {
            playbackPosition: playbackStatus.positionMillis,
            playbackDuration: playbackStatus.durationMillis,
          });
        }
    
        // ao finalizar audio
        if(playbackStatus.didJustFinish){
          const nextAudioIndex = this.state.currentAudioIndex + 1;
          if(nextAudioIndex >= this.totalAudioCount){
            this.state.playbackObj.unLoadAsync();
            this.updateState(this, {
              soundObj: null,
              isPlaying: false,
              currentAudioIndex: 0,
              currentAudio: this.state.audioFiles[0],
              playbackPosition: null,
              playbackDuration: null,
            });
            return await storeAudioForNextOpen(this.state.audioFiles[0], 0);
          }
          const audio = this.state.audioFiles[nextAudioIndex];
          const status = await playNext(this.state.playbackObj, audio.uri);
          this.updateState(this, {
            soundObj: status,
            isPlaying: true,
            currentAudioIndex: nextAudioIndex,
            currentAudio: audio,
          });
    
          await storeAudioForNextOpen(audio, nextAudioIndex);
        }
    }

    componentDidMount(){
        this.getPermission();
        if(this.state.playbackObj === null){
            this.setState({...this.state, playbackObj: new Audio.Sound()});
        }
    }

    updateState = (prevState, newState = {}) => {
        this.setState({...prevState, ...newState});
    }

    render() {
        const {
            audioFiles,
            dataProvider,
            permissionError,
            playbackObj,
            soundObj,
            currentAudio,
            isPlaying,
            currentAudioIndex,
            playbackPosition,
            playbackDuration,
        } = this.state;
        if(permissionError){
            return(
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',}}>
                    <Text style={{fontSize: 25, textAlign: 'center', color: 'red'}}>Permissão negada.</Text>
                </View>
            );
        }
        return (
        <AudioContext.Provider value={{
            audioFiles,
            dataProvider,
            playbackObj,
            soundObj,
            currentAudio,
            isPlaying,
            currentAudioIndex,
            totalAudioCount: this.totalAudioCount,
            playbackPosition,
            playbackDuration,
            updateState: this.updateState,
            loadPreviousAudio: this.loadPreviousAudio,
            onPlaybackStatusUpdate: this.onPlaybackStatusUpdate,
        }}
        >
            {this.props.children}
        </AudioContext.Provider>
        );
  }
};

export default AudioProvider;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
