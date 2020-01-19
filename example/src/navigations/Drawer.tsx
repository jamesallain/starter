import * as React from 'react';
import {
  View,
  ScrollView,
  AsyncStorage,
  YellowBox,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Provider as PaperProvider,
  DefaultTheme as PaperLightTheme,
  DarkTheme as PaperDarkTheme,
  Subheading,
  Appbar,
  List,
  Switch,
  Divider,
} from 'react-native-paper';
import { Asset } from 'expo-asset';
import {
  InitialState,
  useLinking,
  NavigationContainerRef,
  NavigationNativeContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {
  createStackNavigator,
  Assets as StackAssets,
  StackNavigationProp,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';

export const Drawer = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Root"
        options={{
          title: 'Examples',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons size={size} color={color} name="folder" />
          ),
        }}
      >
        {({
          navigation,
        }: {
          navigation: DrawerNavigationProp<RootDrawerParamList>;
        }) => (
          <Stack.Navigator
            screenOptions={{
              headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
            }}
          >
            <Stack.Screen
              name="Home"
              options={{
                title: 'Examples',
                headerLeft: () => (
                  <Appbar.Action
                    color={theme.colors.text}
                    icon="menu"
                    onPress={() => navigation.toggleDrawer()}
                  />
                ),
              }}
            >
              {({
                navigation,
              }: {
                navigation: StackNavigationProp<RootStackParamList>;
              }) => (
                <ScrollView
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                    }}
                  >
                    <Subheading>Dark theme</Subheading>
                    <Switch
                      value={theme.dark}
                      onValueChange={() => {
                        AsyncStorage.setItem(
                          THEME_PERSISTENCE_KEY,
                          theme.dark ? 'light' : 'dark'
                        );

                        setTheme(t => (t.dark ? DefaultTheme : DarkTheme));
                      }}
                    />
                  </View>
                  <Divider />
                  {(Object.keys(SCREENS) as (keyof typeof SCREENS)[]).map(
                    name => (
                      <List.Item
                        key={name}
                        title={SCREENS[name].title}
                        onPress={() => navigation.push(name)}
                      />
                    )
                  )}
                </ScrollView>
              )}
            </Stack.Screen>
            {(Object.keys(SCREENS) as (keyof typeof SCREENS)[]).map(name => (
              <Stack.Screen
                key={name}
                name={name}
                component={SCREENS[name].component}
                options={{ title: SCREENS[name].title }}
              />
            ))}
          </Stack.Navigator>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};
