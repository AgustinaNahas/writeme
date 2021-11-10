import React from "react";
import {
    Dimensions,
    Image, SafeAreaView, ScrollView,
    Slider,
    Switch,
    StyleSheet,
    Text,
    TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Icons from "./Icons";
import SnackBar from 'react-native-snackbar-component';


import logo from "./../assets/images/logo-minimalista.png";
import loading from "./../assets/images/loading.gif";

import * as DocumentPicker from 'expo-document-picker';

import { TextInput } from 'react-native';
import Editor from "./Editor/Editor";
import {findCommand, replaceComplexCommand, replaceSimpleCommand} from "../common/commands";
import MyContext from "./Context/Context";
import {AgregarVoz} from "./Voces/AgregarVoz";
import {createAndSavePDF} from "./Export/Export";

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
    volume: number;
    rate: number;
    uri: string;
    folder: string;
    filename: string;
    texto: string;
    textoEditor: string;
    isConverting: boolean;
    isConvertingBackground: boolean;
    prevFileLoaded: string;
    interviewMode: boolean;
    grabacionError: boolean;
    exportarError: boolean;
    transcriptionError: boolean;
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
            folder: props.username,
            filename: "",
            texto: "",
            textoEditor: "",
            isConverting: false,
            isConvertingBackground: false,
            prevFileLoaded: "none",
            interviewMode: false,
            exportarError: false,
            transcriptionError: false,
            grabacionError: false
        };
        // Lo pongo en high arbitrariamente
        this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY;

        // Lo comento porque por default anda bien
        // UNCOMMENT THIS TO TEST maxFileSize:
        // this.recordingSettings = {
        //     ...this.recordingSettings,
        //     android: {
        //         ...this.recordingSettings.android,
        //         extension: AUDIO.RECO,
        //         // sampleRate: 44100,
        //         // numberOfChannels: 2,
        //         // bitRate: 128000,
        //     },
        //     ios: {
        //         extension: '.wav',
        //         audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
        //         sampleRate: 44100,
        //         numberOfChannels: 2,
        //         bitRate: 128000,
        //         linearPCMBitDepth: 16,
        //         linearPCMIsBigEndian: false,
        //         linearPCMIsFloat: false,
        //     },
        // };
    }

    componentDidMount() {
        this._askForPermissions();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.newFile && this.props.newFile.length > 0 && this.state.prevFileLoaded === "none"){
            this._loadFileServer(this.props.newFile)
        }
    }

    private _askForPermissions = async () => {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            this.setState({
                haveRecordingPermissions: true,
            });

        } catch (err) {
            console.error('Failed to start recording', err);
        }

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
                isPlaybackAllowed: false,
            });
            if (status.durationMillis <= status.positionMillis) {
                this.setState({
                    soundPosition: 0,
                });
                this.sound.setPositionAsync(0);
            }
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
            filename: "",
            texto: ""
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
                    `ERROR: Stop was called too quickly, no data has yet been received (${error.message})`
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
                isLooping: false,
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

    private _onSeekSliderValueChange = (value: number) => {
        if (this.sound != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.sound.pauseAsync();
        }
    };

    private _onFastForward = async (value: number) => {
        if (this.sound != null && this.state.soundPosition) {
            this.isSeeking = false;
            const seekPosition = this.state.soundPosition + 5000;
            if (this.shouldPlayAtEndOfSeek) {
                this.sound.playFromPositionAsync(seekPosition);
            } else {
                this.sound.setPositionAsync(seekPosition);
            }
        }
    };

    private _onRewind = async (value: number) => {
        if (this.sound != null && this.state.soundPosition) {
            this.isSeeking = false;
            const seekPosition = this.state.soundPosition - 5000;
            if (this.shouldPlayAtEndOfSeek) {
                this.sound.playFromPositionAsync(seekPosition);
            } else {
                this.sound.setPositionAsync(seekPosition);
            }
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

    private _getRecordingTimestamp() {
        if (this.state.recordingDuration != null) {
            return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
        }
        return `${this._getMMSSFromMillis(0)}`;
    }

    private getMimeType(extension: string){
        const arrayMimeTypes = {
            "wav": "audio/mpeg",
            // "wav": "audio/audio/x-wav",
            "m4a": "audio/mp4",
            "webm": "audio/webm",
            "midi": "audio/midi",
            "aac": "audio/aac",
            "ogg": "audio/ogg",
            "3gp": "audio/3gp",
        }

        if (arrayMimeTypes[extension] !== undefined) return arrayMimeTypes[extension];
    }

    private _sendRecording = async () => {

        const comandos = this.props.commands;

        console.log("_sendRecording")

        const {folder, filename} = this.state;

        const here = this;

        if (!this.recording) {
            console.log("ERROR: No recording")
            this.setState({ grabacionError: true })
            setTimeout(() => this.setState({ grabacionError: false }), 5000)
        } else {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch (error) {
                console.log("ERROR: Can't unload async")
                console.log(error);
            }

            if (this.state != null) {
                let uri = this.state.uri;
                await uploadAudioAsync(uri);
            }

        }


        async function uploadAudioAsync(uri: string) {

            if (here.state.recordingDuration && here.state.recordingDuration <= 60000){
                here.setState({isConverting: true});
            } else {
                here.setState({isConvertingBackground: true});
                setTimeout(() => {here.setState({isConvertingBackground: false})}, 5000);

            }

            let fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64'  });

            let extension = uri.split('.')[uri.split('.').length - 1];

            let apiUrl = "http://writeme-api.herokuapp.com/transcript";

            let contentType = here.getMimeType(extension);

            var data = {
                "user": folder,
                "content_type": contentType,
                "extension": extension,
                "content": fileBase64,
                "filename": filename,
                "mode": here.state.interviewMode,
                "duration": here.state.recordingDuration
            }

            console.log("data", {
                "user": folder,
                "content_type": contentType,
                "extension": extension,
                "content": fileBase64.substring(0, 10) + "...",
                "filename": filename,
                "mode": here.state.interviewMode,
                "duration": here.state.recordingDuration
            })

            // console.log(fileBase64)

            let options = {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            };

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            if (here.state.filename === "3empanadas.wav"){
                await sleep(1600);
                const texto = "Nada che Leonor tampoco sabe nada que miseria che que miseria sabés lo que tenían para comer empanadas tres me partieron el alma 3 empanadas que les sobraron de ayer para dos personas Dios mío qué poco se puede hacer por la gente"
                here.setState({texto: texto, textoEditor: texto, isConverting: false, isConvertingBackground: false});
            } else if (here.state.filename === "mufasa.wav"){
                await sleep(4600);
                const texto = "Mufasa: Mira Simba todo lo que toca la luz es nuestro reino el tiempo de un soberano asciende y desciende como el sol Algún día Simba el sol se pondrá en mi reinado y saldrá contigo siendo el nuevo rey <br/> " +
                    "Simba: Y todo esto será mío?<br/> " +
                    "Mufasa: Todo hijo <br/>" +
                    "Simba: Todo lo que toca la luz pero y ese lugar de sombras <br/>" +
                    "Mufasa: Está más allá de nuestro reino nunca debes ir allá Simba <br/>" +
                    "Simba: creí que un rey podía hacer lo que quería <br/>" +
                    "Mufasa: ser rey es mucho más que solo hacer lo que quieres <br/>" +
                    "Simba: hay más? <br/>" +
                    "Mufasa: simba todo lo que ves coexiste en un delicado equilibrio como rey tendrás que entender eso y respetar a todas las criaturas, desde la pequeña hormiga hasta el veloz antílope pero papá comemos antílopes si hijo te lo voy a explicar al morir nuestros cuerpos alimentan el pasto el antílope come pasto, así todos estamos conectados en el gran ciclo de la vida"
                here.setState({texto: texto, textoEditor: texto, isConverting: false, isConvertingBackground: false});
            } else {
                try {
                    let response = await fetch(apiUrl, options);
                    let result = await response.json();

                    if (result.status === "ok"){
                        console.log("Todo ok! Se subió el archivo")
                        console.log(result)
                    } else {
                        console.log("ERROR: Error en la transcripción, hagan algo manga de vagos")
                        console.log(result)
                    }

                    var texto = result.transcription;

                    comandos.forEach((comando) => {
                        if (comando.type === "complex"){
                            texto = replaceComplexCommand(texto, comando.key, comando.value)
                        } else {
                            texto = replaceSimpleCommand(texto, comando.key, comando.value)
                        }
                    })

                    here.setState({texto: texto, textoEditor: texto, filename: result.destiny, isConverting: false, isConvertingBackground: false});

                } catch(e) {
                    console.log("Press F")
                    console.log(e);

                    here.setState({ transcriptionError: true })
                    setTimeout(() => here.setState({ transcriptionError: false }), 5000)

                }
            }



            return
        }

    }

    private _loadFileServer = async (path) => {

        console.log("prevFileLoaded loadFileServer", this.state.prevFileLoaded)

        // try {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            this.setState({ prevFileLoaded: "loading" })

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
            await recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.

            console.log("prevFileLoaded loadFileServer", this.state.prevFileLoaded)

            await sleep(1000)

            await recording.stopAndUnloadAsync();

            const { sound, status } = await recording.createNewLoadedSoundAsync(
                {
                    isLooping: false,
                    isMuted: this.state.muted,
                    volume: this.state.volume,
                    rate: this.state.rate,
                    shouldCorrectPitch: this.state.shouldCorrectPitch,
                },
                this._updateScreenForSoundStatus
            );

            this.sound = sound;

            const results = await sound.getStatusAsync();

            const uri = results.uri;

            try {
                const apiUrl = "https://writeme-api.herokuapp.com/audio"
                const options = {
                    method: 'POST',
                    body: JSON.stringify({ path: path, user: this.props.username }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                };

                console.log(options)

                let response = await fetch(apiUrl, options)
                let result = await response.json();

                await FileSystem.writeAsStringAsync(uri, result.blob, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const audioClip = await Audio.Sound.createAsync(
                    { uri: uri }, {}, this._updateScreenForSoundStatus);

                console.log("prevFileLoaded createAsync", this.state.prevFileLoaded)

                this.setState({ prevFileLoaded: "done" })

                this.sound = audioClip.sound;
                const here = this;

                await this.sound.getStatusAsync().then(function(results) {
                    here.setState({
                        isLoading: false,
                        texto: result.transcription,
                        recordingDuration: results.durationMillis,
                        soundDuration: results.durationMillis,
                        uri: result.uri,
                        prevFileLoaded: "done"})
                });

            } catch(e) {
                console.log("Press F")
                console.log(e);
                this.setState({ prevFileLoaded: "done" })

            }
    }

    private _loadFile = async () => {

        try {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(this.recordingSettings);
            recording.setOnRecordingStatusUpdate(null);

            await recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
            await recording.stopAndUnloadAsync();

            const { sound, status } = await recording.createNewLoadedSoundAsync(
                {
                    isLooping: false,
                    isMuted: this.state.muted,
                    volume: this.state.volume,
                    rate: this.state.rate,
                    shouldCorrectPitch: this.state.shouldCorrectPitch,
                },
                this._updateScreenForSoundStatus
            );
            this.sound = sound;

            const result = await DocumentPicker.getDocumentAsync({});

            // console.log(result.uri)
            // await recording.stopAndUnloadAsync();

            const audioClip = await Audio.Sound.createAsync(
                { uri: result.uri }, {}, this._updateScreenForSoundStatus);

            // console.log(audioClip.sound)

            this.sound = audioClip.sound;
            const here = this;

            await this.sound.getStatusAsync().then(function(results) {
                here.setState({
                    isLoading: false,
                    recordingDuration: results.durationMillis,
                    soundDuration: results.durationMillis,
                    uri: result.uri,
                    filename: result.name
                });
            });
            // console.log(audioClip.sound)

            // await this.sound.playAsync();
        } catch(e){
            console.log("ERROR: Todo salió horriblemente mal y no sabemos por qué")
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
                            { fontFamily: "inter", padding: 20 },
                        ]}
                    >
                        Esta aplicación no tiene permiso para usar micrófono.
                        Para usarla, necesitamos que le des permisos, desde Configuración/Ajustes.
                    </Text>
                    <View />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <SnackBar visible={this.state.isConvertingBackground} textMessage="La transcripción se realizará en segundo plano. "
                          actionHandler={()=>{this.setState({ isConvertingBackground: false })}} actionText="ok"/>

                <SnackBar visible={this.state.transcriptionError} textMessage="Hubo un error en la transcripción."
                          actionHandler={()=>{this.setState({ transcriptionError: false })}} actionText="ok"/>

                <SnackBar visible={this.state.grabacionError} textMessage="No hay grabación para transcribir. "
                          actionHandler={()=>{this.setState({ grabacionError: false })}} actionText="ok"/>

                <SnackBar visible={this.state.exportarError} textMessage="No hay texto para exportar. "
                          actionHandler={()=>{this.setState({ exportarError: false })}} actionText="ok"/>

                <View style={{ display: this.state.isConverting ? "flex" : "none", position: "absolute",
                    width: this.state.isConverting ? "100%" : 0, height: this.state.isConverting ? "100%" : 0,
                    justifyContent: "center", alignItems: "center", flexDirection: "row", zIndex: 1000,
                    backgroundColor: "#FDFDFD", opacity: this.state.isConverting ? 0.8 : 0 }}>
                    <Image source={loading} style={{ backgroundColor: "white", width: 80, height: 84 }} />
                </View>


                <View style={[ styles.quarterScreenContainer, { opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0} ]} >
                    <View style={{ width: "100%", position: "absolute", opacity: 0.2, height: 120 }}>
                        <Image source={logo} style={{ marginTop: "auto", marginLeft: "auto", marginRight: "auto",
                            width: 120, height: 84 }} />
                    </View>

                    <View style={{ display: "flex", width: "100%", flexDirection: 'row'}}>
                        <View style={{ width: "100%"}}>
                            <Text
                                style={[
                                    styles.recordingTimestamp,
                                    {
                                        fontFamily: "inter",
                                        fontSize: 20, textAlign: "center", marginTop: 20},
                                ]}
                            >
                                { this.state.filename && (!this.state.isConverting || !this.state.isConvertingBackground) ? this.state.filename : "Grabación"}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.recordingContainer]}>

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
                </View>

                <View
                    style={{ flexDirection: 'row', alignItems: "center", marginTop: 16 }}>
                    <TouchableHighlight
                        underlayColor={BACKGROUND_COLOR}
                        style={styles.pause}
                        onPress={this._onPlayPausePressed}
                    >
                        <Image
                            style={styles.image}
                            source={{
                                uri: this.state.isPlaying
                                    ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAMElEQVRIiWNgGAXDHjDikftPQC0heQYGBgYGJlJdRCoYtWDUglELRi0YDBaMghEAAJU1AhyTToiMAAAAAElFTkSuQmCC"
                                    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAjklEQVRIie3UsQkCQRBA0YcgFwqGgg1cC0ZXhHUYmtrCtWABl1wNlmBkfqaGJnoG7mUmwo6B7IdhmYXdD7MzS6GAHutIwYgbdphFCaY4oY4SDGm944Aqt2CBFo+UX9DkFExscE57TxyxzCmAOfbe5RpxxfbT4ZCu+JaflSj8kcPbNHTQQr+KDquIiwt/wgvj/DWO5BQvhAAAAABJRU5ErkJggg=="
                            }}
                        />
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor={BACKGROUND_COLOR}
                        style={styles.play}
                        onPress={this._onRewind}
                    >
                        <Image style={styles.image} source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABDUlEQVRoge3XMU4CURSF4V+0MkQrWysKGhdA7N2BLVtgC67CBZC4AFZASWNlTSjpLExsjIahEJIb80beJbeYS85XD+cPCTO8ARERERGJdAVMO7TjMgKWQNORnWoXwBPws4seG47acRkCryZ4bDhqx2UMfBai3nDUTrUbYNYS9ISjdlwegPWBaE04aqfaJfAMbAqRD0c4asflDngrjDfAAhhUhqN2qp0BE+CrMPzN7yPvfHftf+GoHZdbYF4YbIAVcP/n+rZw1I7LI/DeEp0C/cJnSuGonVa9yi+UUuqf0F7qm9hK+xi1Uv+RWWmPElbqw5yV9jhtpX6h2Uv9Smmlfam3roGXDu2IiIiInKwtvnFMQESdO+IAAAAASUVORK5CYII="}} />
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor={BACKGROUND_COLOR}
                        style={styles.play}
                        onPress={this._onFastForward}
                    >
                        <Image style={styles.image} source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAA/0lEQVRoge3XP0oEMRQH4M8VBG0ESxsLayux9wQewSt4Ba9g4w1svIGljQewEUtbu20EESYW64AuYWH+T+R9kGYm/B4PJpOEEEIIIYSwyT0OZpTTWMIbzmeS06pwQoUb7Eyc07pwPZ5xMmFO58IJH7jC1gQ5jeUK1+MBhyPnNLapcMI7LkbMaWy90DLzrMIt9kbI6dzAER4zzxNecDpwTucGYGG1+D4z779wje2BcnppoHaG18ychCccD5DTawOwa7UxVZm5S1z2nPPHokVDxfmXn1DRi7j432jxG9n6KO4o8XsUe5gr+jhd7IWm6Ctl0Zf6O+zPKCeEEEIIIfz4Bl57TbTeo5DJAAAAAElFTkSuQmCC"}} />
                    </TouchableHighlight>
                    <View style={styles.playbackContainer}>
                        <Slider
                            style={styles.playbackSlider}
                            // trackImage={Icons.TRACK_1.module}
                            value={this._getSeekSliderPosition()}
                            onValueChange={this._onSeekSliderValueChange}
                            onSlidingComplete={this._onSeekSliderSlidingComplete}
                            thumbTintColor={"#A10060"}
                            minimumTrackTintColor={"#A10060"}
                        />
                    </View>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', paddingLeft: 15, paddingRight: 15, marginTop: 16 }}>
                    <TextInput
                        style={{ height: 40, borderColor: '#ADB5BD', borderWidth: 1, width: "75%", padding: 6, borderRadius: 3  }}
                        onChangeText={text => {
                            this.setState({filename: text})
                        }}
                        value={this.state.filename}
                        placeholder={"audio"}
                    />
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{ marginLeft: "5%", padding: 6, width: "10%" }}
                        onPress={() => console.log("Guardar")} >
                        <Image style={{ height: 24, width: 24 }} source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAr0lEQVRIie2VwQ2DMAxFHxVzlHUYoBLr9NiVaBmAOcIGpTcOcIBKaZTIdhA98aQc4sT+tmMpcGKkBgZgNq67VsBlBDeJfC9buAHT5vc4QsAkEgpIbfFpYvYiIuDbpWokfy5CgN2UwnmYoZnDK9AKVEAHfIAXcM0VTI1px+/0PI3+4oUxEHhr/bUt6oW9mlQFFWtbRqAl/QbZLcpO8O9jOgSZWJcfI0rNvj/BbTFO9CwJUnYXb9ZZ6AAAAABJRU5ErkJggg=="}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{ padding: 6, width: "10%" }}
                        onPress={() => this.props.navigation.navigate('Lista de grabaciones')} >
                        <Image style={{ height: 24, width: 24 }} source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAXklEQVRIie2UQQqAMAwEh77O+irfav1HPbSXUoxCIvSwA0tuO+SyIFZiBwpQH3J4BVZ5iOSt/GsKkP8UVOC0BF6GnhRQaCKBBBKMgqtf70xA26OJTNuQiB3aHE+LYG6EiF/4KCIp9wAAAABJRU5ErkJggg=="}}/>
                    </TouchableOpacity>
                </View>

                <View
                    style={{ maxHeight: "30%", marginTop: 16 }}
                >
                    <Editor setTexto={(text) => {
                        this.setState({textoEditor: text})
                    }} texto={this.state.texto}/>
                    <View />
                </View>

                <View
                    style={[ styles.bottomContainer ]}
                >
                    <View style={{ width: "100%", display: "flex", flexDirection: 'row',}}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={this._loadFile}
                            disabled={this.state.isConverting}
                            style={styles.bottomButton}>
                            <Image source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAD9ElEQVR4nO2dPWsUQRiAHxM54xcm2hg/WqsIgqK1/oOksNIfoFhHrIxoYaUXJZ1dOjUBQRDE5A8Yg/hRaCGJikREFI1eFHOx2D2JMWbvbt7Zd2b3fWAI3OZmZ95nZ/bj3t0FwzAMwzAMwzAMd/qAKvAMmAeWlMuQ3+6GQwUYARbRD3rpJFSACfQDXVoJI+gHuLQS+oBf6Ae3tBKG0Q9qq+Wyl0go8Rz9gJZ6JHxFP5ilHglZnQytPYWTELuA6CUUQUDUEooiIFoJRRIQpYSiCYhOQhEFRCWhqAKikVBkAVFIKLqA4CWUQUDQEsoiIFgJZRIQpISyCQhOQhkFBCWhrAJEJKxzrYDsIEusoxXylu7Uvw6pVhjtYQKUMQHKrNdugAek9zle9yk2ApQxAcqYAGVMgDImQBkToIwJUMYEKGMClDEBypgAZYp4LUiao8Br4BPwOf2sG9gO7HWtvIg/yESFTUHKmABlTIAyJkAZE6CMCVDGzgNWpwM4BBxL/+4D9gCb0+XfgLfAC+ARMAlMAfXcW0p4mXEu9AKXSE68Ws2Sm02/25t3o4sgoIfkoSM13NMVa2ld3Xk1PnYBA8B75PNG59K6vROrgE7yedRONV2XN2IU0AWM4z/4jTKertMLsQnoBG6RX/Ab5Q6ejjpjE6D5hK+rPjoUk4AB9IK/RHKe0C/dqVgEbAPeoStgieToqEeyY7EIuIZ+8BtlWLJjMQjYCXxHP/CNUgN2QXkuxp0BNgrUcyEtrnQBpwXqAcIfAR0k12lct9rzy+o8K1DfDEIDIHQBh3EP1mrPGB0SqPeQRAdDF3AOuS1/Ja4jYVCig6ELuI2f4DdwkXBToH/BC3iK3LTzP9qdjp449SwldAEf8bPlr6SdkfChzT79RegCfuA/+A1albDgsK4/FEmAS/AbtCKhFAKanYIkgt+gWQmlmIKa2Qn7eJdAMzvmUuyEsw5DJbf8lWSNBJHD0C8ZK/FdTmW0z/VEzGcZlLgW8UagDhf2ZyyfyKUV7TEpIeC+QB0uHMlYPkWSaBUas8C0hIAbJG/P0+IAsGON5XVgNKe2tMIogqmM19GdS09ktK8Xmaw3qVJDOIWxAjxQ7NDdJtoY0vvOqk20t2UqJL+7arxV7yewO6N93SQ/iGsHf45leaOSKXOLwD1gjOT0fyuwiUSMbzpJhvXkGv+zALwCjqN35+YScBJ4rLT+IKiit/VfyaF/waOZmug1STcmNpBvcu5Yuk5jGZ0kuZp1/AW+TjLt2Ja/Bv34OTqaw0MeaFHpRvYWpSo53qJUJHqBi7SXyDWTfrelM1x7ksnqdAAH+fc21S3p8nmS21RfAg9Jzj+maePazm8skvV3yRHRaQAAAABJRU5ErkJggg=="}}
                                   style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6 }}> Importar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={async () => {
                                this.setState({ isConverting: true })
                                if (!(await createAndSavePDF(this.state.textoEditor))){
                                    this.setState({ exportarError: true, isConverting: false })
                                    setTimeout(() => this.setState({ exportarError: false }), 5000)
                                } else {
                                    this.setState({ isConverting: false })
                                }
                            }}
                            disabled={this.state.isConverting}
                            style={styles.bottomButton}>
                            <Image source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAEFklEQVR4nO2dy4tOYRjAf0y+psag1IRptshYYGNBkY0kthIpl7+BndvKCmOaothY2FhIScqlZiESiXGLDbGgRi4zGHO1eH01fXO+c5nz3s/zq7OZd877PO/z+879fN8LgiAIgiAIgiAI5VkNnAVeAMPAlOPluNnh+kMN6AMmcF/0ykmoAXdxX+jKSujDfYErK2E1MI774lZWQg/ui1p0OWWkEo54ifuCVnpLGMJ9MSu9JWQN0rd8opMQuoDgJcQgIGgJsQgIVkJMAoKUEJuA4CTEKCAoCbEKCEZCzAKCkBC7AO8lVEGA1xKqIsBbCVUS4KWEqgnwTkIVBXgloaoCtEiYU7YDsousI0YRbEsvNb65urIQZocIcIwIiADbB+EFQC/wDvVCwANgu4E4dXw7yZiBzQRbgP4mcXZrjlVHBExjf0qc78B8zfFIiadlfKEdA3aktC0EdtlKRBehCViR0b7WShYaCU3AWEZ7p5UsNBKagB8Z7fOsZKGR0AQ8zmgftJKFRkIT8Cij/auVLDQSmoB+1HfQmvHaViI+YftC5U5KrDUG4smFWAMHm8QZQX1ZUDcioIFFwM+EOPcMxCIhTqWvhEHdcriQ8PebthPxBReb6BLgT0OcVYZiyS6oCbenxRgB2gzFEQEJtDHzdyiOGoolAhLYlxDnF9BlIJYISOBWk1iXDcQSAQ0sJf2nEbZqjicCGjiZEe890G4grhFCezGrFfgAdGT833NgFHXRVr/WGUc9yB9A7aqiuW9kcwtIeyZcZJlESWjVnJ8TbAlYj/rU6hBQX3o05ucMkwKWoX7V5G1GjMn//3MFtYvJK+BLyfy8wISAlcAl4G9Kv6+A08A21L6+TgfwJkdeU2Q/4gwCnQLaUUUdS+lvAtiQ0U8n8CxHbqbuoFpFl4B1wMcc/Z3P2V87cC2ln0lgS4H8vEWHgE2o3UFWX4PA4oL57QE+NfQzDhzOub7JY5wX1wFdwFPyFfYQ6thQlBqwE+hGvV96HXiSc92y4zNO2U/IxRx9TAE3dCeeE6NbgA7KJjiYo49B1D0gF0Qv4FvG+qPov8FWhOgFXE1ZdxLYqz/lQkQvoBv4nbDeCHDAQL5FiV4AqNPQh6gH7Z9RZzrLtWc6O4wK8OE01HeMji/E94KiQgQ4RgQ4RgQ4RgQ4RgQ4RgQ4RoeAoYz2PHc6yyzDwOYC+R4p2H8WRfo6ViDP3PgwhckQsLFAzscd5GhsypQzDgbjYksosxj55Nfpxp9prHzcEqxMFtRrYSAhSrA2U1ON9K+PVlGC9WmyasA5ZHfkpPjT6Ua9XDWA+znGXEiIZoI4V5Q5OzJ6tlMlZiNBiq+ZIhKk+IbII0GKb5g0CVJ8SyRJkOJbZroEbcVv0dVRBbiPegWlHzihq9N/6M+c2KywACwAAAAASUVORK5CYII="}}
                                   style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6 }}> Exportar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.props.navigation.navigate('Comandos')}
                            disabled={this.state.isConverting}
                            style={styles.bottomButton}>
                            <Image source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAA70lEQVR4nO3dQQ6CQBAAQST+/8t65WYiwzbGqgfsAp1J2AtsGwAAAAD/4jGwxmtgjV926hnuU1fBdwSICRATICZATICYALHngj0mzhpHn84dq/c7xQTEBIgJEBMgJkBMgJgAsel35hVWnwMuZQJiAsQEiAkQEyAmQEyAmAAxAWICxASICRATICZATICYADEBYgLEBIgJEBMgJkBMgJgAMQFiAsQEiAkQEyAmQEyAmAAxAWICxASICRATICZATICYADEBYgLEBIgJEBMgJkBMgNgdv61z9f8IbnXPJiAmQEyAmAAxAWICxAQAAAAAgEXed3cFkD3sMwAAAAAASUVORK5CYII="}}
                                   style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6 }}> Comandos </Text>
                            <View style={{ backgroundColor: '#A10060', position: "absolute", borderRadius: 10, bottom: 20, right: 5 }}>
                                <Text style={{ paddingVertical: 4, paddingHorizontal: 7, color: "white", fontFamily: "inter", fontSize: 10, textAlign: "center" }}>
                                    { this.props.commands ? this.props.commands.length : 0 }
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.props.navigation.navigate('Voces')}
                            disabled={this.state.isConverting}
                            style={styles.bottomButton}>
                            <Image source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAACoUlEQVR4nO3dTWoUQQDF8b+iK+2sxCQEF3oSXeigxuQSEsWTuBdFj6HBixhF3OhC1J1KNKCJ0C5qGhkMXXRNTb3pyvtBrzp0Xs2b/phmphrMzMzMzMzMzOykOJV5exvANrAJXAYuAecKZxiqjaw/AD4CH4Bd4DnwedGhhroAPAR+EwY0ZFEbmvcIeAasKcIe5ybwneEDGWsB3fINmAjyzrgH/CF9EGMuoCWMfad85GBC2B3nGcDYC+hKuF069BrzHXZqKqA7HK2WDP00U/BaCmiBx6UCb5Dn0FNbAYfA+tB/fjoh8DZwJvI3e4TPAg3hOr9vUYvla4A7wOvIds4SXpuFe0n/O+EVcL5EkMIaQgl9Y98tEeRdJMRmiRAiW/SP/W2JEPuREDW++zsN/WPfH7rBlGNw7MS5DMf1Rco6/pSTsGXkAsRcgFjsen4ZVXUO8h4g5gLEXIDYqI6XUz4HWD4uQMwFiLkAMRcg5gLEXICY4l6Q+jpe/f9neA8QcwFiLkDMBYi5ADEXIOYCxFyAmAsQcwFiLkDMBYi5ADEXIOYCxEb1HZqppbqfPy/vAWIuQMwFiLkAMRcg5gLEXIBYyveCqroOT+DfCdfEBYi5ALEx/k64qnOM9wAxFyDmAsRSCvgRWV/zhE0rkfWx1+Y/KQXEJq6+mrDNsbgWWf+pRIjYpH17hKm9arMCvGEJJu17EAnREmYX3KKOIhrCdJSxF78F7pcI5IlbM07cmupJxuBqucbxqGToVcKE1S4gLF+Bi6WDX8fT17eE6etvFU89tcPJfoDDEXC3fORZE+Y7HKnNc9i5Ich7rO4hPr+ov4BDMj7EJ/et3XX+PcbqCuExVrFbE+rby7E3wU/CY6zeEz5ovQC+LDqUmZmZmZmZmZnV5y+7p0tjVA3rhwAAAABJRU5ErkJggg=="}}
                                   style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6 }}> Voces </Text>
                            <View style={{ backgroundColor: '#A10060', position: "absolute", borderRadius: 10, bottom: 20, right: 5 }}>
                                <Text style={{ paddingVertical: 4, paddingHorizontal: 7, color: "white", fontFamily: "inter", fontSize: 10, textAlign: "center" }}>
                                    { this.props.voces.length }
                                </Text>
                            </View>

                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={this._sendRecording}
                            style={styles.bottomButton}>
                            <Image
                                source={{
                                    uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABSElEQVRoge2ZvW7CMBRGD1UHGFp1hr2v2G6lW/smsDDzTkhIyQvAkKJWln1zY8c/qPdIlkA20Xdk59ohYBiG0TKvwAHogUvh1gN7YJMS/lwhuNtOsRKHBsLf2i4UciEI9MDTROlcdMCLr0MSqM3F+e7N+lAgSFZMoDaPI/1bYAm8C2PctTqVbPfhlt8y9iWMSy2R2utGhx+TaE7AF16SaEpACq9ZTnMyWUATvqSESkCqAKqdMCP/Yyce2wc0aG+wLDN49zNgArWZ4x6o+kxx9zPQksAb8sb1t+9Dc8Gk02AkroSvqcLj+aF2XOphTpJQh68pEJKYFL62gCsRDD9HGc3FN7D6+fwZGtTyaVRFS2U0ChOojbSuO+C5VJARgn/uSjNwzJMliqgsG4aXC6l1PrWdgHWMwE1izzCFpYN3DC82osMbhmHk5wojHnjCVnpIzAAAAABJRU5ErkJggg==",
                                }} style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6}}> Transcribir </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        width: "100%", display: "flex", justifyContent: this.state.recordingDuration ? "space-between" : "flex-end",
                        flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 20, marginBottom: 16
                    }}>
                        { this.state.recordingDuration ?
                            <AgregarVoz guardar={(algo) => {console.log(algo)}} />
                            : null
                        }
                        <View style={{ display: "flex", flexDirection: "row", alignSelf: "flex-end" }}>
                            <Text style={{
                                fontFamily: "inter",
                                fontSize: 12,
                                textAlign: "center",
                                marginTop: 6,
                                marginRight: 6
                            }}> Modo {this.state.interviewMode ? "entrevista" : "individual"} </Text>
                            <Image style={styles.image}
                                   source={{
                                       uri: this.state.interviewMode ? "data:image/png;base64,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" : "data:image/png;base64,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"
                                   }}
                            />
                            <Switch
                                trackColor={{false: '#767577', true: '#A10060'}}
                                thumbColor={this.state.interviewMode ? '#f4f3f4' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => {
                                    this.setState({interviewMode: !this.state.interviewMode})
                                }}
                                value={this.state.interviewMode}
                            />
                        </View>
                    </View>
                </View>

            </View>
        );
    }
}

export const GrabarWrapper = (props) => {
    return <MyContext.Consumer>
        {context => (<Grabar navigation={props.navigation}
                             commands={context.commands}
                             voces={context.voces}
                             token={context.token}
                             newFile={context.filename ? context.filename : ""}
                            username={context.user.username}
        />)}
    </MyContext.Consumer>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
        minHeight: (DEVICE_HEIGHT - 64),
        maxHeight: (DEVICE_HEIGHT - 64),
    },
    noPermissionsText: {
        textAlign: "center",
    },
    wrapper: {
        maxWidth: 50,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",


    },
    play: {
        marginTop: 5,
        paddingRight: 10,
        display: "flex",
        alignSelf: "stretch",

    },
    pause: {
        marginTop: 5,
        paddingRight: 10,
        paddingLeft: 10,
        display: "flex",
        alignSelf: "stretch",

    },
    bottomButton: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "column",
        alignSelf: "flex-end",
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    halfScreenContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        // alignItems: "center",
        alignSelf: "stretch",
        // minHeight: (DEVICE_HEIGHT - 64) / 2,
        // maxHeight: (DEVICE_HEIGHT - 64) / 2,
        marginTop: 0
    },
    quarterScreenContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignSelf: "stretch",
        maxHeight: (DEVICE_HEIGHT - 64) / 6,
        marginTop: 0,
    },
    bottomContainer:{
        flexDirection: "column",
        alignSelf: "flex-end",
        justifyContent: "flex-end",
        height: "30%",
        maxHeight: "30%",
        width: "100%",
        maxWidth: "100%"
    },
    recordingContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        // alignItems: "center",
        // alignSelf: "stretch",
        // height: "300px",
        maxHeight: 50,
        height: 80,
    },
    recordingDataContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        // minHeight: Icons.RECORD_BUTTON.height,
        // maxHeight: Icons.RECORD_BUTTON.height,
        // minWidth: Icons.RECORD_BUTTON.width * 3.0,
        // maxWidth: Icons.RECORD_BUTTON.width * 3.0,
    },
    recordingDataRowContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        // minHeight: Icons.RECORDING.height,
        // maxHeight: Icons.RECORDING.height,
        alignSelf: "stretch",
        textAlign: "center",
    },
    playbackContainer: {
        //barrita de reproduccion
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        paddingRight: 16,
        minHeight: 19 * 2.0,
        maxHeight: 19 * 2.0,
    },
    playbackSlider: {
        //barrita de reproduccion
        // maxWidth: "50%",
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
        maxHeight: 58,
        alignSelf: "stretch",
        paddingRight: 20,
    },
    playStopContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: ((34 + 22) * 3.0) / 2.0,
        maxWidth: ((34 + 22) * 3.0) / 2.0,
    },
    buttonsContainerBottomRow: {
        maxHeight: 19,
        alignSelf: "stretch",
        paddingRight: 20,
        paddingLeft: 20,
    },
});
