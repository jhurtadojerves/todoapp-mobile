import { FlatList, ListRenderItemInfo } from 'react-native';
import { Paragraph, Separator } from 'tamagui';

import { User } from '@/domain/models/user';
import { UserCard } from '@/presentation/components/users/user-card';

type Props = {
  users: User[];
};

export function UserList({ users }: Props) {
  const renderUser = ({ item }: ListRenderItemInfo<User>) => <UserCard user={item} />;

  return (
    <FlatList
      data={users}
      renderItem={renderUser}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <Separator height={12} />}
      ListEmptyComponent={
        <Paragraph color="$muted" textAlign="center">
          No hay usuarios disponibles
        </Paragraph>
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8, gap: 12 }}
    />
  );
}
