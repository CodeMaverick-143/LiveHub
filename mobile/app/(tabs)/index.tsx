

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useStreams } from '@/hooks/useStreams';
import { StreamCard } from '@/components/streams/StreamCard';
import { SkeletonList } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/streams/EmptyState';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { Stream } from '@/types';
import { formatViewerCount } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = ['All', 'Technology', 'Music', 'Gaming', 'Education', 'Health'];

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: streams, isLoading, isError, refetch, isRefetching } = useStreams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo<Stream[]>(() => {
    if (!streams) return [];
    return streams.filter((s) => {
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.creatorName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || s.category === category;
      return matchSearch && matchCategory;
    });
  }, [streams, search, category]);

  const totalViewers = useMemo(
    () => streams?.reduce((sum, s) => sum + s.viewerCount, 0) ?? 0,
    [streams]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      <View style={styles.header}>
        <View>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hello, {user?.username ?? 'there'}</Text>
            <MaterialIcons name="waving-hand" size={18} color="#FFE082" />
          </View>
          <Text style={styles.subtitle}>
            {streams?.length ?? 0} streams live •{' '}
            <Text style={styles.viewerCount}>{formatViewerCount(totalViewers)} watching</Text>
          </Text>
        </View>
        <View style={styles.livePulse}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>


      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search streams or creators..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search streams"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>


      <View style={styles.categoryOuter}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
          renderItem={({ item }) => {
            const isSelected = category === item;
            return (
              <Pressable
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setCategory(item)}
                accessibilityLabel={`Filter by ${item}`}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>


      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={() => <SkeletonList count={1} />}
          showsVerticalScrollIndicator={false}
        />
      ) : isError ? (
        <EmptyState
          title="Could not load streams"
          description="Check your connection and pull down to refresh"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No live streams right now"
          description="Be the first to go live or check back soon"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <StreamCard
              stream={item}
              onPress={() => router.push(`/stream/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    includeFontPadding: false,
  },
  viewerCount: {
    color: Colors.primaryLight,
    fontWeight: Typography.semibold,
  },
  livePulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.live,
  },
  liveText: {
    fontSize: 10,
    color: Colors.live,
    fontWeight: Typography.bold,
    includeFontPadding: false,
    textTransform: 'uppercase',
  },


  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    includeFontPadding: false,
    paddingVertical: 0,
  },


  categoryOuter: {
    height: 44,
    marginBottom: Spacing.sm,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 32,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: Typography.semibold,
  },


  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});