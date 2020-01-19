import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';

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

import { getItem } from './components/localKeyStore';

import LinkingPrefixes from './LinkingPrefixes';
import SimpleStack from './screens/SimpleStack';
import NativeStack from './screens/NativeStack';
import ModalPresentationStack from './screens/ModalPresentationStack';
import BottomTabs from './screens/BottomTabs';
import MaterialTopTabsScreen from './screens/MaterialTopTabs';
import MaterialBottomTabs from './screens/MaterialBottomTabs';
import AuthFlow from './screens/AuthFlow';
import CompatAPI from './screens/CompatAPI';
import Library from './screens/library/Library';

YellowBox.ignoreWarnings(['Require cycle:', 'Warning: Async Storage']);

type RootDrawerParamList = {
  Root: undefined;
  Another: undefined;
};

type RootStackParamList = {
  Home: undefined;
} & {
  [P in keyof typeof SCREENS]: undefined;
};

const SCREENS = {
  SimpleStack: { title: 'Simple Stack', component: SimpleStack },
  NativeStack: { title: 'Native Stack', component: NativeStack },
  ModalPresentationStack: {
    title: 'Modal Presentation Stack',
    component: ModalPresentationStack,
  },
  BottomTabs: { title: 'Bottom Tabs', component: BottomTabs },
  MaterialTopTabs: {
    title: 'Material Top Tabs',
    component: MaterialTopTabsScreen,
  },
  MaterialBottomTabs: {
    title: 'Material Bottom Tabs',
    component: MaterialBottomTabs,
  },
  AuthFlow: {
    title: 'Auth Flow',
    component: AuthFlow,
  },
  CompatAPI: {
    title: 'Compat Layer',
    component: CompatAPI,
  },
};
const GRAPHQL_ENDPOINT = 'http://localhost:1100/graphql';
const ENABLE_QUERY_BATCHING = true;

const AuthenticatedLink = setContext(async (_, { headers }) => {
  const token = await getItem('AuthToken', undefined);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const httpLink = ENABLE_QUERY_BATCHING
  ? new BatchHttpLink({ uri: GRAPHQL_ENDPOINT })
  : new HttpLink({ uri: GRAPHQL_ENDPOINT });

const client = new ApolloClient({
  link: AuthenticatedLink.concat(httpLink),
  // shouldBatch: true,
  //addTypename: true,
  cache: new InMemoryCache({
    dataIdFromObject: (obj: any) => obj.nodeId || null,
  }),
});

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
const THEME_PERSISTENCE_KEY = 'THEME_TYPE';

Asset.loadAsync(StackAssets);

export default function App() {
  const containerRef = React.useRef<NavigationContainerRef>();

  // To test deep linking on, run the following in the Terminal:
  // Android: adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:19000/--/simple-stack"
  // iOS: xcrun simctl openurl booted exp://127.0.0.1:19000/--/simple-stack
  // The first segment of the link is the the scheme + host (returned by `Linking.makeUrl`)
  const { getInitialState } = useLinking(containerRef, {
    prefixes: LinkingPrefixes,
    config: {
      Root: Object.keys(SCREENS).reduce<{ [key: string]: string }>(
        (acc, name) => {
          // Convert screen names such as SimpleStack to kebab case (simple-stack)
          acc[name] = name
            .replace(/([A-Z]+)/g, '-$1')
            .replace(/^-/, '')
            .toLowerCase();

          return acc;
        },
        {}
      ),
    },
  });

  const [theme, setTheme] = React.useState(DefaultTheme);

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        let state = await getInitialState();

        if (state === undefined) {
          const savedState = await AsyncStorage.getItem(
            NAVIGATION_PERSISTENCE_KEY
          );
          state = savedState ? JSON.parse(savedState) : undefined;
        }

        if (state !== undefined) {
          setInitialState(state);
        }
      } finally {
        try {
          const themeName = await AsyncStorage.getItem(THEME_PERSISTENCE_KEY);

          setTheme(themeName === 'dark' ? DarkTheme : DefaultTheme);
        } catch (e) {
          // Ignore
        }

        setIsReady(true);
      }
    };

    restoreState();
  }, [getInitialState]);

  const paperTheme = React.useMemo(() => {
    const t = theme.dark ? PaperDarkTheme : PaperLightTheme;

    return {
      ...t,
      colors: {
        ...t.colors,
        ...theme.colors,
        surface: theme.colors.card,
        accent: theme.dark ? 'rgb(255, 55, 95)' : 'rgb(255, 45, 85)',
      },
    };
  }, [theme.colors, theme.dark]);

  if (!isReady) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <PaperProvider theme={paperTheme}>
        {Platform.OS === 'ios' && (
          <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        )}
        <NavigationNativeContainer
          ref={containerRef}
          initialState={initialState}
          onStateChange={state =>
            AsyncStorage.setItem(
              NAVIGATION_PERSISTENCE_KEY,
              JSON.stringify(state)
            )
          }
          theme={theme}
        >
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

                              setTheme(t =>
                                t.dark ? DefaultTheme : DarkTheme
                              );
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

                  {(Object.keys(SCREENS) as (keyof typeof SCREENS)[]).map(
                    name => (
                      <Stack.Screen
                        key={name}
                        name={name}
                        component={SCREENS[name].component}
                        options={{ title: SCREENS[name].title }}
                      />
                    )
                  )}
                </Stack.Navigator>
              )}
            </Drawer.Screen>
          </Drawer.Navigator>
        </NavigationNativeContainer>
      </PaperProvider>
    </ApolloProvider>
  );
}
