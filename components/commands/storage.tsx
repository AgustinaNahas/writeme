import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeCommands = async (value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('@commands', jsonValue)
    } catch (e) {
        // saving error
    }
}

export const getCommands = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@commands')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        // error reading value
    }
}