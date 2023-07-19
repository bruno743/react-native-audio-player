import { Dimensions } from 'react-native';
import React, { Component } from 'react';
import { AudioContext } from '../context/AudioProvider';
import { RecyclerListView, LayoutProvider } from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screens from '../components/Screens';
import { selectAudio } from '../misc/AudioController';

export class AudioList extends Component {
  static contextType = AudioContext;

  constructor(props){
    super(props);

    this.currentItem = {};
  }

  layoutProvider = new LayoutProvider(
    (i) => 'audio',
    (type, dimension) => {
      dimension.width = Dimensions.get('window').width;
      dimension.height = 70;
    }
  );

  handleAudioPress = async (audio) => {
    await selectAudio(audio, this.context);
  }
  
  componentDidMount(){
    this.context.loadPreviousAudio();
  }
  
  rowRenderer = (type, item, index, extendedState) => {
    return(
      <AudioListItem
        title={item.filename}
        isPlaying={extendedState.isPlaying}
        duration={item.duration}
        activeItem={this.context.currentAudioIndex === index}
        onAudioPress={() => this.handleAudioPress(item)}
      />
    )
  }

  render() {
    return (
      <AudioContext.Consumer>
        {({dataProvider, isPlaying}) => {
          if(!dataProvider._data.length) return null;
          return (
            <Screens>
              <RecyclerListView
              dataProvider={dataProvider}
              layoutProvider={this.layoutProvider} 
              rowRenderer={this.rowRenderer} 
              extendedState={{isPlaying}} />
            </Screens>
          )
        }}
      </AudioContext.Consumer>
    );
  }
};

export default AudioList;
