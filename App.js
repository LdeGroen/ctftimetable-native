import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { colors } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import TimetableScreen from './src/screens/TimetableScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded] = useFonts({
        Oswald_400Regular,
        Oswald_600SemiBold,
        Oswald_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer>
                    <StatusBar style="light" />
                    <Stack.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            headerStyle: { backgroundColor: colors.primary },
                            headerTintColor: colors.textOnDark,
                            headerTitleStyle: { fontFamily: 'Oswald_600SemiBold' },
                            contentStyle: { backgroundColor: colors.appBackground },
                        }}
                    >
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{ title: 'CTF Timetable' }}
                        />
                        <Stack.Screen
                            name="Timetable"
                            component={TimetableScreen}
                            options={({ route }) => ({ title: route.params?.event ?? 'Timetable' })}
                        />
                        <Stack.Screen
                            name="Favorites"
                            component={FavoritesScreen}
                            options={{ title: 'Favorieten' }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.appBackground,
    },
});
