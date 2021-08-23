import React from "react";
import {
    Dimensions,
    Image,
    Slider,
    StyleSheet,
    Text,
    TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import * as Icons from "./Icons";

import { TextInput } from 'react-native';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
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
    sincro: boolean;
    volume: number;
    rate: number;
    uri: string;
    folder: string;
    filename: string;
    texto: string;
};

export default class Grabar extends React.Component<Props, State> {
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
            filename: "prueba1",
            texto: "",
            sincro: false
        };
        this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY;

        // UNCOMMENT THIS TO TEST maxFileSize:
        this.recordingSettings = {
            ...this.recordingSettings,
            android: {
                ...this.recordingSettings.android,
                extension: '.wav',
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
            },
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
        this._askForPermissions();
    }

    private _askForPermissions = async () => {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const permission = await MediaLibrary.getPermissionsAsync();
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

    private cambiarEstado(estado: State) {
        this.setState(estado);
    };

    private _sendRecording = async () => {
        console.log("_sendRecording")

        const {folder, filename} = this.state;

        const here = this;

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

        async function uploadAudioAsync(uri: string) {

            let fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64'  });

            console.log(fileBase64)

            let apiUrl = "http://writeme-api.herokuapp.com/transcript";

            var data = {
                "folder": folder,
                "type": "audio/mpeg",
                "extension": "wav",
                "file": fileBase64
            }

            let options = {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            };


            console.log(options)

            try {
                let response = await fetch(apiUrl, options);
                let result = await response.json();

                console.log("Todo ok! Se subió el archivo")
                console.log(result)

                if (result.status === "ok"){
                    console.log(result.status)
                    console.log(result.transcription)
                    here.setState({texto: result.transcription});
                }

            } catch(e) {
                console.log("Press F")
                console.log(e);
            }

            return
        }

    }


    render() {

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

        const clickHandler = () => {
            //function to handle click on floating Action Button
            alert('Floating Button Clicked');
        };

        return (
            <View style={styles.container}>
                <View style={[ styles.quarterScreenContainer, { opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0} ]} >
                    <View />
                    <Text
                        style={[
                            styles.recordingTimestamp,
                            { fontFamily: "inter",
                                fontSize: 20, },
                        ]}
                    >
                        {this.state.sincro ? this.state.filename : ""}
                    </Text>
                    <View style={styles.recordingContainer}>
                        {/*<View />*/}
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            // onPress={this._onRecordPressed}
                            disabled={this.state.isLoading}
                        >
                            <Image style={styles.image}
                                   source={{uri: "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAB6SURBVHgB7dixCsAgDADRWPr/v2wHp26KyqG5txVEOAgSGiHlVmJaqf/vuuDO/vufOJwBNANoBtDe/qOj7/3u840jRDOAduMrxG6XoxwhmgE0A2gG0Ayg3bgLrd599t7vCNEMoGX6LzT6euw+3zhCNANoBtCOD5Cy+wCzIBNY1+h1FgAAAABJRU5ErkJggg=="}}
                            />
                        </TouchableHighlight>
                        <View />
                        <View style={styles.recordingDataRowContainer}>
                            <Text
                                style={[
                                    styles.recordingTimestamp,
                                    { fontFamily: "inter",
                                        fontSize: 48, },
                                ]}
                            >
                                {this._getRecordingTimestamp()}
                            </Text>
                        </View>
                        <View />
                        <View />
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this._onRecordPressed}
                            disabled={this.state.isLoading}
                        >
                            <Image style={styles.image}
                                   source={{uri: this.state.isRecording ?
                                           "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIuSURBVHgB7ZjhTQJBEIWfaAFagdiBVqCWYAHGMxagViBWoFTAYeJ/rADsgA68DvS3CeAbXZJh4WAP59wY9ksu7N5ONvO4nZ2dBRKJxL9mC4Z0kO3uANcT4EQe93o4BtqXyHPUgJkAOt9sAH02myUmBYWcUkgBQxowYoXzwrdA+UowxEQAncqw3PkpIuIGhpgI4CTX3qsul8senwNp6wGu2WMYYrWEDnWHjre41j9kvY+9f1wFtwlmMaDRgSpCUCO1CPhLkoDYJAGxSQJikwTEJgmIzU6IURfZRPcvkC8thOTMPz0DSaGDGgn9AjMHsmdc7es+1Qx0fxt4EMdFCNt33lxDGBIqoNCdT4yOdH8EvOo+P1fGid/4vEtbj0l9DEOCBIw9BxvzZ/pHeCJLKKyL+9Av0PP6F7q2lfUuBTuWiyicjSlBAujgALPOydrueDYFg/uATl5O1Dpne8B393yOrG8khOBrFSncG57TdOqWTj0iIpXuhZ6Q9f2alqJa58jvEYlKiWwkK8XbUqWAp7BOyH4vcSO2MKTyzRydOHGXWIsmyynyBT+7zdDZN/lzyJg5dlvqrk6EfpJchMQQ52stGgvKxBoJaDp15uJh5pbN7f+ZcwzeWC2sdRaiiJ7sKgjb+2tl7cOc3jZRTUgV25X8+jQqmdUJkSTVnnjnIsG9a4uN2MKQyjFQhkt28swFZobcPANPSQVNbDajIqsTSVIBZoOygegCyjJsIpHYEL4A5mSjcUuKMyMAAAAASUVORK5CYII="
                                           : ( this.state.recordingDuration ?
                                               "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJ2SURBVHgB7ZnhUeMwEIXf5SiAq+BCB1ABXAfXwA3OXAHcVUBSAUkFMTD8hwoSOkgHuAPymyExb4k8swiSSPEGZxh9M55ItkbeZ2ml1QZIJBKJJvkGY4bI9veAsxI4kcvdnsyBQQd5DmNMBdD4dgsYsdhe0qSgkF8UUsCIFgxZY7zwKlBGCXbvtIFGZVhtfIWI+AcjzASwozPv1iWnyw9eB1LWDzhvj2H3XjMOdYWGdznXpzLf594XV85dG1Mf0GhHFSHYElsT8FkkAU2TBDRNEtA0SUDTJAFNsxfa8BJZqeunyFcehiTmr2IgOehgS8SMwJuA7AZ/f+o61Yx1/TtwIYaLEJbPvb4mMCJGQKErT5gd6foMuNd1DlfGzh94PUpZP5PzMYwIFjD3DGy9j+n78EQuobA83MeMwK1XP9VnW5nvcmDHahGFa2NGsAAaOMZb42RuD702BZ37gEZ2SjXPWR7zXo/XkWVGQohKq8jBveUZTaP+06g+anKFbEg/6sUKjM4L8UUj/0xLUd0/yHuoQbVMS1/PrIYKid7IZjJTvCVVDvDyBUPWe/EbabvsufTlckcZAtgoM8fOT1wS66MOc4q8w2K1mbj2bf4c0meO3ZK672+E/kbpWJvJ2zi1SKN+O3/YKMsWKOAV91E+9I+NYyF2diurCsLW/lq4TXF0jczf0esFc3rZRJyQmLYVbfEPjtSD9g+TaFR2VidENqlB6cVFgrs3kDbSFvUoqoL5/wMVsdHrKh9wTN1/DF19MzicbhIqy8vFhvkuRbnTAmTalYvVZ7ysza4KmLoQJV/XcOcESNDHn35oRntnBLjp0rGOVhOJr84LTLbUaT0iDnoAAAAASUVORK5CYII="
                                               : "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJqSURBVHgB7ZnhURsxEIWfHQpIKshRQUwFkAriFJDhPCmApILYFYRU4CMz/AYqwFSAqYDrAP9mBpu3oGOWxT5Lh+CGQd/MDdo7Ie07rXTSGkgk3jcdRGaM/OMGsLcAduRyt6dz4N8ARYHIRBVA57MucMpitqJKSSFfKaREJLqIyBrnhTuBMkqI12cc6FSOeucrRMQvRCKaADa0Z24dMFw+8dqUsn7AuN1GvH6j0dMGHR8y1mcS73PzxtXkfjZR54BGT1QRghfixQS8FklA2yQBbZMEtE0S0DZJQNts+FY8QL7Q9i6K2sOQ7PmrPZAcdBC5/YqQEXi0ITvEz8/aZm8TbX8A/orjIoTlP6atqTZYp1fXVx0hAkptXONmS9s3wJm2+TpzNn7J60rK+pmcj03bmTY6RmAd3gLmxsHu0z39PozIFZT2cM8R+qZtCr6AJyEjcGzsXX22lXiXAzvqRZSuzgMSZktG6BieeAuggxM8dk5ie2zqlJx8m3RgsFBhwPKE90a8tmxGYsn8KF1fXgSlVeTg3jVO06nf7HAfDeDKI84PTXuDkPxRcF7oP/JTe6alqOEPFCMEQOclCWCF340gAvD+DlRwtRnQ4XMWH+JfDvAUlvHZaF3Syi2rY76Evnk0s/PDh0aZOTrRp4ijFQ0WFHKC+1ieuvoZ//To+LabsE8SW3T+O+t7T17VXzOciPEyZwKZubgPdl54Vm7UIxdai6xOi3vnSzQkSnLXrU6yomSe/yLfg1GMbHXs7PQOhfT5Vr90zEolb5v3LuQjFbLOryP67wMVTXeXoaQDTdskAW3z5gUkEolEu9wCzsi2NC28K/cAAAAASUVORK5CYII=")}}
                            />
                        </TouchableHighlight>
                    </View>
                    <View />
                </View>

                <View style={[
                    styles.halfScreenContainer, {
                        justifyContent: "start"
                    }]}>
                    <View />
                    <View style={{width: "100%", padding: 15  }}>
                        <View style={{ padding: 15, borderColor: '#CED4DA', borderWidth: 1, borderRadius: 3  }}>
                            <Text
                                style={{ fontFamily: "open-sans",
                                    fontSize: 16, width: "100%", textAlign: "left", height: 120}}
                            >
                                {this.state.texto ? this.state.texto : "Acá vas a encontrar el texto de la transcripción" }

                            </Text>
                        </View>
                    </View>
                    <View style={{ display:
                            true
                                // (!this.state.isRecording && this.state.recordingDuration)
                                ? 'flex' : "none", flexDirection: 'row', paddingLeft: 15, paddingRight: 15 }}>
                        <TextInput
                            style={{ height: 40, borderColor: '#CED4DA', borderWidth: 1, width: "75%", padding: 6, borderRadius: 3  }}
                            onChangeText={text => {
                                this.setState({filename: text})
                            }}
                            value={this.state.filename}
                        />
                        <View
                            style={{ width: "25%", flex: 1, justifyContent: "space-between", alignItems: "center", flexDirection: "row",
                                marginLeft: 15, marginRight: 15}}
                        >
                            <TouchableHighlight
                                underlayColor={BACKGROUND_COLOR}
                                // onPress={this._onRecordPressed}
                                disabled={this.state.isLoading}
                            >
                                <Image style={{ width: 20, height: 20 }}
                                       source={{uri: "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACvSURBVHgBrZXRDYAgDEQrEziiG8gGdkNHQhE0BgVKe5fwA+S9hLSUKGUmcivhsiTmA5/2c4VTspE5kRFZkZkkS94IdskDz4v8fcJ2yQfO5Q2DpA83SORwhWQcPiDRwwUSO7whwcErEiy8IZHBHYnigmxPlfLNUd/KL/x6FgZJmtVilYhKUSsZqvNRiaqJWCgxdSh3JJD255rEA+AVyTX830Mf8rdwOfSzJNlA8Tf8ABlEoChg1GBoAAAAAElFTkSuQmCC"}}
                                />
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor={BACKGROUND_COLOR}
                                onPress={this._sendRecording}
                                disabled={this.state.isLoading}
                            >
                                <Image style={{ width: 20, height: 20 }}
                                       source={{uri: "data:image/svg;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEISURBVHgBtZbhDYIwEIVfCf91BEbQCdQNHAEnUCfATWQDRqBOoE4gG6gLWFsoGJDTU9ovaWhK8x69Xq8AQASIXDc1sF211gTviMyBOGkiqhclBaAk/mOsdZa2f9M6C/081R7WHXsMY0esxJlBr0lITIyBYAYWj1XbwHyrSFCFLQexgpS/sb00iRPAD/e648uggdqDdEDKsgwkHOE9REyDYK0z4mIz44iyfrH5dtCChKg50QfR9Ic0VXHPoD5E2IABJ0QRMT6CIwNJjB/gxkBtUZbgFqYUp2AQMuZoMTVFFXMTljNXnGtgKMDc1C7eD1rnyhQSTlBzvLLPyR8FdVdksE6ZB/HcaD8BTO2eEWgu1rgAAAAASUVORK5CYII="}}
                                />
                            </TouchableHighlight>
                        </View>

                    </View>
                </View>


                <View
                    style={[
                        styles.quarterScreenContainer,
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
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.props.navigation.navigate('Lista grabaciones')}
                    style={styles.touchableOpacityStyle}>
                    <Image
                        source={{
                            uri:
                                'https://img.icons8.com/material-outlined/24/000000/edit-folder.png',
                        }}
                        //source={require('./images/float-add-icon.png')}
                        style={styles.floatingButtonStyle}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
        minHeight: (DEVICE_HEIGHT - 64),
        maxHeight: (DEVICE_HEIGHT - 64),
    },
    noPermissionsText: {
        textAlign: "center",
        borderColor: 'purple', borderWidth: 1,
    },
    wrapper: {
        maxWidth: 50,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",

    },
    touchableOpacityStyle: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 50,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "black",
        backgroundColor:'white',
        padding: 30
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 30,
        height: 30,
    },
    halfScreenContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        // alignItems: "center",
        alignSelf: "stretch",
        minHeight: (DEVICE_HEIGHT - 64) / 2,
        maxHeight: (DEVICE_HEIGHT - 64) / 2,
        marginTop: 0
    },
    quarterScreenContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        // alignItems: "center",
        alignSelf: "stretch",
        minHeight: (DEVICE_HEIGHT - 64) / 4.0,
        maxHeight: (DEVICE_HEIGHT - 64) / 4.0,
        marginTop: 0
    },
    recordingContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        // alignItems: "center",
        // alignSelf: "stretch",
        // height: "300px",
        maxHeight: 50,
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
        justifyContent: "center",
        alignItems: "center",
        // minHeight: Icons.RECORDING.height,
        // maxHeight: Icons.RECORDING.height,
        alignSelf: "stretch",
        textAlign: "center"
    },
    playbackContainer: {
        //barrita de reproduccion
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: Icons.THUMB_1.height * 2.0,
        maxHeight: Icons.THUMB_1.height * 2.0,
    },
    playbackSlider: {
        //barrita de reproduccion
        alignSelf: "stretch",
    },
    recordingTimestamp: {
        // paddingLeft: 20,
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
