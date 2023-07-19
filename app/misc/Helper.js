import AsyncStorage from '@react-native-async-storage/async-storage';

// ao fechar o aplicativo, salva o ultimo audio selecionado
export const storeAudioForNextOpen = async (audio, index) => {
    await AsyncStorage.setItem('previousAudio', JSON.stringify({audio, index}));
};

export const convertTime = (time) => {
    const minutes = time / 60;
    const absMinutes = minutes.toString().split('.')[0];
    const fracMinutes = parseInt(minutes.toString().split('.')[1].slice(0, 2));
    const sec = Math.ceil((60 * fracMinutes) / 100);

    if(sec == 60){
        return parseInt(absMinutes) < 9 ? `0${parseInt(absMinutes) + 1}:00` : `${parseInt(absMinutes) + 1}:00`;
    }
    
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