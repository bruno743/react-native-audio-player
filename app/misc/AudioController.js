import { storeAudioForNextOpen } from '../misc/Helper';

// play
export const play = async (playbackObj, uri) => {
    try {
        return await playbackObj.loadAsync(
            {uri: uri},
            {shouldPlay: true, progressUpdateIntervalMillis: 1000},
        );
    } catch (error) {
        console.log('play error', error.message);
    }
};

// pause
export const pause = async (playbackObj) => {
    try {
        return await playbackObj.setStatusAsync({shouldPlay: false});
    } catch (error) {
        console.log('pause error', error.message);
    }
};

// resume
export const resume = async (playbackObj) => {
    try {
        return await playbackObj.playAsync();
    } catch (error) {
        console.log('pause error', error.message);
    }
};

// play next
export const playNext = async (playbackObj, uri) => {
    try {
        await playbackObj.stopAsync();
        await playbackObj.unloadAsync();
        return await play(playbackObj, uri);
    } catch (error) {
        console.log('pause error', error.message);
    }
};

export const selectAudio = async (audio, context) => {
    try {
        const {playbackObj, soundObj, currentAudio, updateState, audioFiles, onPlaybackStatusUpdate} = context;

        // seleciona um audio pela primeira vez
        if (soundObj === null){
            const status = await play(playbackObj, audio.uri);
            const index = audioFiles.indexOf(audio);

            updateState(context, {
                currentAudio: audio,
                soundObj: status,
                isPlaying: true,
                currentAudioIndex: index,
            });
            playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
            return storeAudioForNextOpen(audio, index);
        }

        // seleciona o audio enquanto esta tocando
        if(soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id){
            const status = await pause(playbackObj);
            
            return updateState(context, {soundObj: status, isPlaying: false, playbackPosition: status.positionMillis});
        }

        // seleciona o audio pausado
        if((soundObj.isLoaded) &&
        (!soundObj.isPlaying) &&
        (currentAudio.id === audio.id)){
            const status = await resume(playbackObj);
            
            return updateState(context, {soundObj: status, isPlaying: true,});
        }

        // seleciona um audio diferente do atual
        if(soundObj.isLoaded && currentAudio.id !== audio.id){
            const status = await playNext(playbackObj, audio.uri);
            const index = audioFiles.indexOf(audio);

            updateState(context, {
                currentAudio: audio,
                soundObj: status,
                isPlaying: true,
                currentAudioIndex: index,
            });

            return storeAudioForNextOpen(audio, index);
        }
    } catch (error) {
        console.log('Error (selectAudio): ', error.message)
    }
};

// atualiza o status quando os controles de next e previous sao acionados
export const changeAudio = async (context, select) => {
    const {
            playbackObj,
            currentAudioIndex,
            totalAudioCount,
            audioFiles,
            updateState,
        } = context;
    try {
        const {isLoaded} = await playbackObj.getStatusAsync();
        const isLastAudio = currentAudioIndex + 1 === totalAudioCount;
        const isFirstAudio = context.currentAudioIndex <= 0;
        let audio;
        let index;
        let status;

        if(select === 'next'){
            audio = audioFiles[currentAudioIndex + 1];
            if(!isLoaded && !isLastAudio){
                index = currentAudioIndex + 1;
                status = await play(playbackObj, audio.uri);
            }
        
            if(isLoaded && !isLastAudio){
                index = currentAudioIndex + 1;
                status = await playNext(playbackObj, audio.uri);
            }
        
            if(isLastAudio){
                index = 0;
                audio = audioFiles[index];
                if(isLoaded){
                    status = await playNext(playbackObj, audio.uri);
                }else{
                    status = await play(playbackObj, audio.uri);
                }
            }
        }

        if(select === 'prev'){
            audio = context.audioFiles[context.currentAudioIndex - 1]
            if(!isLoaded && !isFirstAudio){
                index = currentAudioIndex - 1;
                status = await play(playbackObj, audio.uri);
            }
        
            if(isLoaded && !isFirstAudio){
                index = currentAudioIndex - 1;
                status = await playNext(playbackObj, audio.uri);
            }
        
            if(isFirstAudio){
                index = totalAudioCount - 1;
                audio = audioFiles[index];
                if(isLoaded){
                    status = await playNext(playbackObj, audio.uri);
                }else{
                    status = await play(playbackObj, audio.uri);
                }
            }
        }

        updateState(context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
        playbackPosition: null,
        playbackDuration: null,
        });

        storeAudioForNextOpen(audio, index);
    } catch (error) {
        console.log('Error (changeAudio): ', error.message);
    }
};
