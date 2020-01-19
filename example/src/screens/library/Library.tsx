import React from 'react';
import { IconButton, List } from 'react-native-paper';
import { useCurrentUserQuery } from '../../graphql';
import { useNavigation } from '@react-navigation/native';

export default function Library() {
  console.log('Library');
  const navigation = useNavigation();

  const { data } = useCurrentUserQuery();
  const currentUser = data?.currentUser;
  console.log('libary');

  // useEffect(() => {
  //   history.replace(routes.LIBRARY.url({}));
  // });

  if (!currentUser) {
    console.log('No current user for Library');
    // removeItem("AuthToken");
    // client.resetStore();
    // history.push(routes.LOGIN.url({}));
  }

  return (
    <List.Section style={{ flexBasis: 0, flexGrow: 1 }}>
      <List.Item
        left={() => <IconButton icon="silverware" />}
        right={() => <IconButton icon="chevron-right" />}
        title="Menus"
        onPress={() => {
          navigation.navigate('Menus');
          // history.push(
          //   routes.MENU_RESULTS.url({
          //     userId: currentUser.id,
          //   })
          // );
        }}
      />
      <List.Item
        left={() => <IconButton icon="food-variant" />}
        right={() => <IconButton icon="chevron-right" />}
        title="Meals"
        onPress={() => {
          navigation.navigate('Meals');
          // history.push(
          //   routes.MEAL_RESULTS.url({
          //     userId: currentUser.id,
          //   })
          // );
        }}
      />
      <List.Item
        left={() => <IconButton icon="account-group" />}
        right={() => <IconButton icon="chevron-right" />}
        title="Profiles"
        onPress={() => {
          navigation.navigate('Profiles');
          // history.push(
          //   routes.PROFILE_RESULTS.url({
          //     userId: currentUser.id,
          //   })
          // );
        }}
      />
    </List.Section>
  );
}
