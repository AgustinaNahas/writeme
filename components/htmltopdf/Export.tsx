import React, { Component } from 'react';

import {
    Text,
    TouchableHighlight,
    View,
} from 'react-native';

import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

import { Platform } from 'react-native';

export async function createAndSavePDF(text: string) {

    console.log(text)

    const html = "<html><style> body{ padding: 50px; } </style> <body>" + text + "</body> </html>"

    try {
        const { uri } = await Print.printToFileAsync({ html });
        if (Platform.OS === "ios") {
            await Sharing.shareAsync(uri);
        } else {
            const permission = await MediaLibrary.requestPermissionsAsync();

            if (permission.granted) {
                await MediaLibrary.createAssetAsync(uri);
            }
        }

    } catch (error) {
        console.error(error);
    }
}