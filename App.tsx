import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import * as Icons from "./components/Icons";

import { TextInput } from 'react-native';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

type Props = {};

type State = {
  haveRecordingPermissions: boolean;
  isLoading: boolean;
  isPlaybackAllowed: boolean;
  muted: boolean;
  soundPosition: number | null;
  soundDuration: number | null;
  recordingDuration: number | null;
  shouldPlay: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  fontLoaded: boolean;
  shouldCorrectPitch: boolean;
  volume: number;
  rate: number;
  uri: string;
  folder: string;
  filename: string;
};

export default class App extends React.Component<Props, State> {
  private recording: Audio.Recording | null;
  private sound: Audio.Sound | null;
  private isSeeking: boolean;
  private shouldPlayAtEndOfSeek: boolean;
  private readonly recordingSettings: Audio.RecordingOptions;

  constructor(props: Props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      uri: "",
      folder: "agus",
      filename: "prueba1"
    };
    this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY;

    // this.recordingSettings.;

    // UNCOMMENT THIS TO TEST maxFileSize:
    this.recordingSettings = {
      ...this.recordingSettings,
      ios: {
        extension: '.wav',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };
  }

  componentDidMount() {
    (async () => {
      await Font.loadAsync({
        "cutive-mono-regular": require("./assets/fonts/CutiveMono-Regular.ttf"),
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
  }

  private _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === "granted",
    });
  };

  private _updateScreenForSoundStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis ?? null,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  private _updateScreenForRecordingStatus = (status: Audio.RecordingStatus) => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
        uri: this.recording && this.recording.getURI() ? this.recording.getURI() : ""
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  private async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  private async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });
    if (!this.recording) {
      return;
    }
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // On Android, calling stop before any data has been collected results in
      // an E_AUDIO_NODATA error. This means no audio data has been written to
      // the output file is invalid.
      if (error.code === "E_AUDIO_NODATA") {
        console.log(
          `Stop was called too quickly, no data has yet been received (${error.message})`
        );
      } else {
        console.log("STOP ERROR: ", error.code, error.name, error.message);
      }
      this.setState({
        isLoading: false,
      });
      return;
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI() || "");
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
      uri: this.recording && this.recording.getURI() ? this.recording.getURI() : ""
    });
  }

  private _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  private _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  private _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  };

  private _onMutePressed = () => {
    if (this.sound != null) {
      this.sound.setIsMutedAsync(!this.state.muted);
    }
  };

  private _onVolumeSliderValueChange = (value: number) => {
    if (this.sound != null) {
      this.sound.setVolumeAsync(value);
    }
  };

  private _trySetRate = async (rate: number, shouldCorrectPitch: boolean) => {
    if (this.sound != null) {
      try {
        await this.sound.setRateAsync(rate, shouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  private _onRateSliderSlidingComplete = async (value: number) => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  private _onPitchCorrectionPressed = () => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  private _onSeekSliderValueChange = (value: number) => {
    if (this.sound != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.sound.pauseAsync();
    }
  };

  private _onSeekSliderSlidingComplete = async (value: number) => {
    if (this.sound != null) {
      this.isSeeking = false;
      const seekPosition = value * (this.state.soundDuration || 0);
      if (this.shouldPlayAtEndOfSeek) {
        this.sound.playFromPositionAsync(seekPosition);
      } else {
        this.sound.setPositionAsync(seekPosition);
      }
    }
  };

  private _getSeekSliderPosition() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return this.state.soundPosition / this.state.soundDuration;
    }
    return 0;
  }

  private _getMMSSFromMillis(millis: number) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number: number) => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  private _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(
        this.state.soundPosition
      )} / ${this._getMMSSFromMillis(this.state.soundDuration)}`;
    }
    return "";
  }

  private _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  private _sendRecording = async () => {
    console.log("_sendRecording")

    const {folder, filename} = this.state;

    if (!this.recording) {
      console.log("Press F")
    } else {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.log("Press F")
        console.log(error);
      }
    }

    if (this.state != null) {
      let uri = this.state.uri;
      await uploadAudioAsync(uri);

    }

    async function uploadAudioAsync(uri) {

      let apiUrl = 'https://storage.googleapis.com/upload/storage/v1/b/ringed-enigma-314221.appspot.com/o?uploadType=media&name=' + folder + "/" + filename + ".wav";

      const response = await fetch(uri);
      const blobAudio = await response.blob();

      let options = {
        method: 'POST',
        body: blobAudio,
        headers: {
          // 'Accept': 'application/json',
          'Content-Type': 'audio/vnd.wave',
          'Authorization': 'Bearer unaKeyDeGoogleQueHayQuePedirleAAgusPorqueTodaviaNoImplementoOAuthComoLaGente'
        },
      };

      try {
        let response = await fetch(apiUrl, options);
        let result = await response.json();

        console.log(result)
        // do something with result
      } catch(e) {
        console.log("Press F")
        console.log(e);
      }

      return
    }

  }

  render() {
    if (!this.state.fontLoaded) {
      return <View style={styles.emptyContainer} />;
    }

    if (!this.state.haveRecordingPermissions) {
      return (
        <View style={styles.container}>
          <View />
          <Text
            style={[
              styles.noPermissionsText,
              { fontFamily: "cutive-mono-regular" },
            ]}
          >
            You must enable audio recording permissions in order to use this
            app.
          </Text>
          <View />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View
        >
          <View />
          <View style={{ display: 'flex', paddingTop: 60, flexDirection: 'row' }}>
            <Text
                style={{ fontFamily: "cutive-mono-regular", width: 150, marginRight: 30, marginLeft: 30 }}
            >
              Nombre de la carpeta
            </Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: 150  }}
                onChangeText={text => {
                  this.setState({folder: text})
                }}
                value={this.state.folder}
            />
          </View>
          <View style={{ display: 'flex', paddingTop: 40, flexDirection: 'row' }}>
            <Text
                style={{ fontFamily: "cutive-mono-regular", width: 150, marginRight: 30, marginLeft: 30 }}
            >
              Nombre de la carpeta
            </Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: 150  }}
                onChangeText={text => {
                  this.setState({filename: text})
                }}
                value={this.state.filename}
            />

          </View>
        </View>
        <View
          style={[
            styles.halfScreenContainer,
            {
              opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}
        >
          <View />
          <View style={styles.recordingContainer}>
            <View />
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onRecordPressed}
              disabled={this.state.isLoading}
            >
              <Image style={styles.image}
                     source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA10lEQVRIie2UTQrCMBSEP1y4qkv1LlJBvYE/pxEXigvrddRjqHiJdlkFXRZ00QlIa9VINsUOhGaS92YeL03gX1AH1kAEhECgNWcIgHtmBC4NQol2AF/z0KWBqbqIF6LmsorKoFwGN9K/xBOP9PWBbmatodirjfFJST3xVxdtpb2B+NHGYKmkjXhdJiH5p2Kn2IWNQRu4KHH6Jm6mmDPQtDEAmACJBLZAn/RMPNK2mMoTYGQrbjAGYvL9NyMGhr+KG7RI+3t4Et4Dc+05xdePnEH5b3KFj3gAFSFB0nZBJ/kAAAAASUVORK5CYII="}}
              />
            </TouchableHighlight>
            <View style={styles.recordingDataContainer}>
              <View />
              <Text
                style={[styles.liveText, { fontFamily: "cutive-mono-regular" }]}
              >
                {this.state.isRecording ? "LIVE" : ""}
              </Text>
              <View style={styles.recordingDataRowContainer}>
                <Image
                  style={[
                    styles.image,
                    { opacity: this.state.isRecording ? 1.0 : 0.0 },
                  ]}
                  source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA10lEQVRIie2UTQrCMBSEP1y4qkv1LlJBvYE/pxEXigvrddRjqHiJdlkFXRZ00QlIa9VINsUOhGaS92YeL03gX1AH1kAEhECgNWcIgHtmBC4NQol2AF/z0KWBqbqIF6LmsorKoFwGN9K/xBOP9PWBbmatodirjfFJST3xVxdtpb2B+NHGYKmkjXhdJiH5p2Kn2IWNQRu4KHH6Jm6mmDPQtDEAmACJBLZAn/RMPNK2mMoTYGQrbjAGYvL9NyMGhr+KG7RI+3t4Et4Dc+05xdePnEH5b3KFj3gAFSFB0nZBJ/kAAAAASUVORK5CYII="}}
                />
                <Text
                  style={[
                    styles.recordingTimestamp,
                    { fontFamily: "cutive-mono-regular" },
                  ]}
                >
                  {this._getRecordingTimestamp()}
                </Text>
              </View>
              <View />
            </View>
            <View />
          </View>
          <View />
        </View>
        <View
          style={[
            styles.halfScreenContainer,
            {
              opacity:
                !this.state.isPlaybackAllowed || this.state.isLoading
                  ? DISABLED_OPACITY
                  : 1.0,
            },
          ]}
        >
          <View />
          <View style={styles.playbackContainer}>
            <Slider
              style={styles.playbackSlider}
              trackImage={Icons.TRACK_1.module}
              thumbImage={Icons.THUMB_1.module}
              value={this._getSeekSliderPosition()}
              onValueChange={this._onSeekSliderValueChange}
              onSlidingComplete={this._onSeekSliderSlidingComplete}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <Text
              style={[
                styles.playbackTimestamp,
                { fontFamily: "cutive-mono-regular" },
              ]}
            >
              {this._getPlaybackTimestamp()}
            </Text>
          </View>
          <View
            style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}
          >
            <View style={styles.volumeContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onMutePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              >
                <Image
                  style={styles.image}
                  source={{
                    uri: this.state.muted
                        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABSklEQVRIid2VsS4FQRSGv05DJUZEVIJGKUo9olYo1K6O5GpE7jNIFDyBRJS03kBBIVokopEQCXFzQ7H/xGQyc2ZtaO6fbHbOnJn/2z0zOwv9pg3A/Zd5C/gCrjOQTg2PeSvpZJ6C7Krf0h7QA1aaQJaAjwKgrXkvwHhTSErrwIDap5p3VHgYHPCUgMTa0pgDxZPAJ9AFJixARxP9lYPMUZWuB8yq71hzNsOBy8BDZNql2ra5hfc6VH5f8Zris3DQfcJ8VTlXeJMF5S4VTyu+DQd5g5yscg2r/1HxkOLXJoBUuQap1uE5AryHBlaJQoC1hS/UnlH+LgQsFiDhG+Ygo7r7RT7P1oOfbeohcQmtY+VE/dsWIIak1sgq1xuFDy2G5DZBDjJVx9xrxwAAjABXyt8AY78xjyE5/Qmk9MMJy9VqAqgjR3V+9ZG+AZnfkmjlyxv5AAAAAElFTkSuQmCC"
                        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA5klEQVRIie2UPw4BQRSHP4TKEbQkREOjVIsDKCQOodE6gYQ9hVsoOIEbsBfQERKKfZuMyXj7z3T7a957O7O/bzPv7UCpP2rt2/zt29wLwDT/BVgAjSLmTwWwlOdBEfOZAhgAd+AF9DTDKRDyfRyxOQ7ACuhIvpO1jQa4KuY2YC75XuqR1GcNkDQl5npL8lDqptQ314tVjZpRzg+MAaGxyXVEpsYSjxL7Ei8afYLeB1eT25IHpGiyrbRjOgQeRGPazQKwIUk/2jaruQ1JuirqeQEQnbe3y86GZFYt5b4TUAEOeSClVH0A4b1bznHC0d4AAAAASUVORK5CYII="
                  }}
                />
              </TouchableHighlight>
              <Slider
                style={styles.volumeSlider}
                trackImage={Icons.TRACK_1.module}
                thumbImage={Icons.THUMB_2.module}
                value={1}
                onValueChange={this._onVolumeSliderValueChange}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
            </View>
            <View style={styles.playStopContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPlayPausePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              >
                <Image
                  style={styles.image}
                  source={{
                    uri: this.state.isPlaying
                        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAjklEQVRIie3UsQkCQRBA0YcgFwqGgg1cC0ZXhHUYmtrCtWABl1wNlmBkfqaGJnoG7mUmwo6B7IdhmYXdD7MzS6GAHutIwYgbdphFCaY4oY4SDGm944Aqt2CBFo+UX9DkFExscE57TxyxzCmAOfbe5RpxxfbT4ZCu+JaflSj8kcPbNHTQQr+KDquIiwt/wgvj/DWO5BQvhAAAAABJRU5ErkJggg=="
                        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAMElEQVRIiWNgGAXDHjDikftPQC0heQYGBgYGJlJdRCoYtWDUglELRi0YDBaMghEAAJU1AhyTToiMAAAAAElFTkSuQmCC"
                  }}
                />
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onStopPressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              >
                <Image style={styles.image} source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAO0lEQVRIiWNgGAXDHjDiEP9PLfOYyDSIaMBCQB6XD9EBTh/T3AejFoxaMGoB4ZxMbpkEBzT3wSgYAQAAYgwDHy/kfC8AAAAASUVORK5CYII="}} />
              </TouchableHighlight>
            </View>
            <View>
              <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  onPress={this._sendRecording}
              >
                <Image
                    style={styles.image}
                    source={{
                      uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABtElEQVRIieXUTW9NURQG4Ke3Js01MaoU8RkiZgQV8RGEmYFJTfwTpQYmYiKI3l9QZj5/gbGJP0CbkEpEqjRcwTE4a+ece5z70evOvMnJzn73Wu979tprb/4HTOIqXmEFa3iNm5j6V/FL+Iisy/cZl4cVv4ifIfQCZ7EJTZzG41j7jZlBRU/hEd5FYoZrPeJvKHYy2Ut4A+b9XYKnGOuRNybfXRZmXZHE1zCL3RgP4344oyjVYmhtLwecLIlPDyBYxQR+6dz5F5xPAQ+DnB1CPGFLGB3G89BbxQ7yA83kZRkVksk8tGMyMUKDI6G5CO9jcmCEBhtDs93AyyCv9EjYiVb6owGwN8ZlOBFu3+S3tYoL+KrokIRy18yV+AaeBH8nkfeDaOMWtga/S94NWSQdrTH4HjuEPXim5naP414pKb0trZJ49UZneBtjK7iZmH/CsZpqOI4FeV/DUiQcrImdw6FYXwpuCret4xn/EQLNLutNRWlr0ehj8CHGfToPMmF/jMt9dLrirs5aV38uHeiDYQ02y9u32qLTiudgReX1XA+u6+z3hDRfxblhxXvhjfzubOsX+Adcb4oyKRiOmgAAAABJRU5ErkJggg==',
                    }}
                />
                {/*<Image style={styles.image} source={Icons.STOP_BUTTON.module} />*/}
              </TouchableHighlight>
            </View>
            <View />
          </View>
          <View
            style={[
              styles.buttonsContainerBase,
              styles.buttonsContainerBottomRow,
            ]}
          >
            <Text style={styles.timestamp}>Rate:</Text>
            <Slider
              style={styles.rateSlider}
              trackImage={Icons.TRACK_1.module}
              thumbImage={Icons.THUMB_1.module}
              value={this.state.rate / RATE_SCALE}
              onSlidingComplete={this._onRateSliderSlidingComplete}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onPitchCorrectionPressed}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            >
              <Text style={[{ fontFamily: "cutive-mono-regular" }]}>
                PC: {this.state.shouldCorrectPitch ? "yes" : "no"}
              </Text>
            </TouchableHighlight>
          </View>
          <View />


        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT,
  },
  noPermissionsText: {
    textAlign: "center",
  },
  wrapper: {},
  halfScreenContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: DEVICE_HEIGHT / 4.0,
    maxHeight: DEVICE_HEIGHT / 4.0,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: Icons.RECORD_BUTTON.height,
    maxHeight: Icons.RECORD_BUTTON.height,
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: Icons.RECORD_BUTTON.height,
    maxHeight: Icons.RECORD_BUTTON.height,
    minWidth: Icons.RECORD_BUTTON.width * 3.0,
    maxWidth: Icons.RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: Icons.RECORDING.height,
    maxHeight: Icons.RECORDING.height,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: Icons.THUMB_1.height * 2.0,
    maxHeight: Icons.THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: "stretch",
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  playbackTimestamp: {
    textAlign: "right",
    alignSelf: "stretch",
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
    width: 30,
    height: 30,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonsContainerTopRow: {
    maxHeight: Icons.MUTED_BUTTON.height,
    alignSelf: "stretch",
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
    maxWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - Icons.MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    maxHeight: Icons.THUMB_1.height,
    alignSelf: "stretch",
    paddingRight: 20,
    paddingLeft: 20,
  },
  timestamp: {
    fontFamily: "cutive-mono-regular",
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
});
