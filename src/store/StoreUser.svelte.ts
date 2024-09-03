import type { CommentFormat } from "./data";
import { userStore } from "./n_store.svelte";
import { Nicolive } from "./Nicolive.svelte";

export interface StoreUser {
  id: number | string;
  name?: string;
  kotehan?: string;
  yobina?: string;
  format?: CommentFormat;
}

export const StoreUser = {
  getById: (id: number | string) => {
    let user = Nicolive.users[id]?.storeUser;
    if (user) return user;
    // user = extentionStateHolder.state.nicolive.users_primitable[id];
    user = userStore.users[id];
    if (user) return user;
    return undefined;
  },

  upsert: (
    user: StoreUser,
    kotehan: string | undefined,
    yobina: string | undefined,
    format: CommentFormat | undefined,
  ) => {
    const kotehanIsNull = !kotehan;
    const yobinaIsNull = !yobina;
    // const formatIsNull = format == null || Object.keys(format).length === 0;

    // extentionStateHolder.state.nicolive.users_primitable[user.id] ??= {
    //   id: user.id, name: user.name,
    // };

    // extentionStateHolder.state.nicolive.users_primitable[user.id].kotehan = kotehanIsNull ? undefined : $state.snapshot(kotehan);
    // extentionStateHolder.state.nicolive.users_primitable[user.id].yobina = yobinaIsNull ? undefined : $state.snapshot(yobina);
    // // extentionStateHolder.state.nicolive.users_primitable[user.id].format = formatIsNull ? undefined : $state.snapshot(format);
    // extentionStateHolder.state.nicolive.users_primitable[user.id].format = $state.snapshot(format);

    userStore.upsert({
      id: user.id, name: user.name,
      kotehan: kotehanIsNull ? undefined : $state.snapshot(kotehan),
      yobina: yobinaIsNull ? undefined : $state.snapshot(yobina),
      format: $state.snapshot(format),
    }, true);


    // onExtentionChanged.emit();
  }
} as const;
