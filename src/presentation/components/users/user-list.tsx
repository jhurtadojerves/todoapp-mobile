import { FlatList, ListRenderItemInfo } from 'react-native';
import { Paragraph, Separator, Spinner } from 'tamagui';

import { User } from '@/domain/models/user';
import { UserCard } from '@/presentation/components/users/user-card';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  users: User[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export function UserList({ users, hasMore, isLoadingMore, onLoadMore }: Props) {
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
      ListFooterComponent={
        hasMore ? (
          isLoadingMore ? (
            <Spinner marginTop="$3" />
          ) : (
            <AppButton label="Cargar más" variant="outlined" marginTop="$3" onPress={onLoadMore} />
          )
        ) : null
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8, gap: 12 }}
    />
  );
}
