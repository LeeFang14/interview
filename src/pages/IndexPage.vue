<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <form
        class="user-from"
        @submit.prevent.stop="isEditing ? updateUser() : addUser()"
      >
        <q-input
          ref="nameRef"
          v-model="tempData.name"
          label="姓名"
          :rules="nameRules"
          @update:model-value="onInputChange"
        />
        <q-input
          ref="ageRef"
          v-model="tempData.age"
          label="年齡"
          :rules="ageRules"
          @update:model-value="onInputChange"
          type="number"
        >
          <template v-slot:hint>請輸入數字</template>
        </q-input>
        <q-btn
          text-color="primary"
          outline
          class="primary-btn"
          :disable="isSubmitDisabled"
          type="submit"
          >{{ isEditing ? '更新' : '新增' }}</q-btn
        >
      </form>

      <q-table
        class="user-table"
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
        :filter="filter"
        title="User List"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th>
              <q-btn
                class="delete-btn"
                text-color="red"
                outline
                label="全部刪除"
                @click="deleteUserList"
                :disable="filteredData.length === 0 || isEditing"
              />
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
                :disable="isEditing && btn.status === 'delete'"
                :class="{
                  'hover-bg-primary': btn.status === 'edit',
                  'hover-bg-danger': btn.status === 'delete',
                }"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useQuasar } from 'quasar';
import { onMounted, ref, computed, nextTick } from 'vue';
import { useUserStore } from '../stores/user-store';
import { User } from '../types/user';

const userStore = useUserStore();
const $q = useQuasar();

interface BtnType {
  label: string;
  icon: string;
  status: string;
}

const tableConfig = ref<QTableProps['columns']>([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
]);
const tableButtons = ref<BtnType[]>([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const blockData = ref<User[]>([]);

const filter = ref<string>('');
const filteredData = computed(() => {
  return blockData.value.filter((user) => {
    return (
      user.name.includes(filter.value) ||
      user.age.toString().includes(filter.value)
    );
  });
});

onMounted(() => {
  fetchUserList();
});

const tempData = ref<{ name: string; age: string }>({
  name: '',
  age: '',
});

// Validate and Reset
const nameRef = ref<{
  validate: () => void;
  resetValidation: () => void;
} | null>(null);

const nameRules = [
  (val: string) => !!val || '*必填',
  (val: string) => !!val.trim() || '*請勿輸入空白',
  (val: string) => val.length <= 15 || '*限輸入15字',
];
const ageRef = ref<{
  validate: () => void;
  resetValidation: () => void;
} | null>(null);
const ageRules = [
  (val: string) => (val !== null && val !== '') || '*必填',
  (val: string) =>
    (Number.isInteger(+val) && +val > 0) || '*限輸入數字(正整數)',
  (val: string) => (+val >= 1 && +val <= 99) || '*限輸入範圍(1-99)',
];

const isSubmitDisabled = computed(() => {
  const nameValid = nameRef.value?.hasError === false;
  const ageValid = ageRef.value?.hasError === false;
  const hasInput =
    tempData.value.name.trim() !== '' || tempData.value.age.trim() !== '';

  return !(hasInput && nameValid && ageValid);
});

function onInputChange() {
  nameRef.value?.validate();
  ageRef.value?.validate();
}

function resetForm() {
  tempData.value.name = '';
  tempData.value.age = '';
}

function resetValidation() {
  nameRef.value?.resetValidation();
  ageRef.value?.resetValidation();
}

// Read
async function fetchUserList() {
  const status = await userStore.fetchUserList();
  if (status === 200) {
    blockData.value = userStore.userList;
  }
}

function handleClickOption(btn: BtnType, data: User) {
  switch (btn.status) {
    case 'edit':
      isEditing.value = true;
      tempData.value = { name: data.name, age: data.age.toString() };
      editingUserId.value = data.id;
      break;

    case 'delete':
      $q.dialog({
        title: '提示',
        message: '是否確定刪除該筆資料？',
        ok: {
          label: '確定',
          flat: true,
          class: 'ok-btn',
        },
        cancel: {
          label: '取消',
          flat: true,
          class: 'cancel-btn',
        },
        persistent: true,
        class: 'confirm-dialog',
      })
        .onOk(() => {
          deleteUser(data);
        })
        .onCancel(() => {
          $q.notify({
            message: '已取消。',
            color: 'ongoing',
            position: 'bottom',
          });
        });
      break;

    default:
      console.warn(`Unsupported button status: ${btn.status}`);
      break;
  }
}

// Create
async function addUser() {
  const payload = {
    ...tempData.value,
    age: parseInt(tempData.value.age, 10),
  };

  const status = await userStore.createUser(payload);

  if (status === 200) {
    resetForm();
    await fetchUserList();
    resetValidation();
    await nextTick();
    $q.notify({
      message: '新增成功！',
      color: 'green',
      position: 'top',
    });
  } else {
    $q.notify({
      message: '新增失敗，請稍後再試。',
      color: 'negative',
      position: 'top',
    });
  }
}

// Update
const isEditing = ref<boolean>(false);
const editingUserId = ref<string | null>(null);
async function updateUser() {
  const payload = {
    id: editingUserId.value,
    ...tempData.value,
    age: parseInt(tempData.value.age, 10),
  };

  const status = await userStore.updateUser(payload);
  if (status === 200) {
    resetForm();
    isEditing.value = false;
    editingUserId.value = null;
    await fetchUserList();
    resetValidation();
    await nextTick();
    $q.notify({
      message: '更新成功！',
      color: 'green',
      position: 'top',
    });
  } else {
    $q.notify({
      message: '更新失敗，請稍後再試。',
      color: 'negative',
      position: 'top',
    });
  }
}

// Delete
async function deleteUser(data) {
  const status = await userStore.deleteUser(data.id);
  if (status === 200) {
    await fetchUserList();
    $q.notify({
      message: '已刪除！',
      color: 'green',
      position: 'top',
    });
  } else {
    $q.notify({
      message: '刪除失敗，請稍後再試。',
      color: 'negative',
      position: 'top',
    });
  }
}

// All Delete
async function deleteUserList() {
  $q.dialog({
    title: '確認刪除',
    message: '是否確定刪除所有用戶資料？',
    ok: {
      label: '確定',
      flat: true,
      class: 'ok-btn',
    },
    cancel: {
      label: '取消',
      flat: true,
      class: 'cancel-btn',
    },
    persistent: true,
    class: 'confirm-dialog',
  })
    .onOk(async () => {
      const userIDs = filteredData.value.map((user) => user.id);
      try {
        const deletePromises = userIDs.map((id) => userStore.deleteUser(id));
        await Promise.all(deletePromises);
        await fetchUserList();
        $q.notify({
          message: '已刪除！',
          color: 'green',
          position: 'top',
        });
      } catch (error) {
        console.error('刪除用戶時出錯:', error);
        $q.notify({
          message: '刪除失敗，請稍後再試。',
          color: 'negative',
          position: 'top',
        });
      }
    })
    .onCancel(() => {
      $q.notify({
        message: '已取消。',
        color: 'ongoing',
        position: 'bottom',
      });
    });
}
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}

.user-from {
  max-width: 1024px;
  padding: 20px;
  margin: 0 auto 48px;
  border: 1px solid #1976d2;
  border-radius: 10px;
  @media (min-width: 1280px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 50px;
    & > .q-field {
      flex-grow: 1;
    }
  }

  .primary-btn {
    margin-top: 16px;
    @media (min-width: 1280px) {
      margin-top: 0px;
    }
  }
}
.user-table {
  max-width: 1024px;
  margin: 0 auto;
}

.primary-btn {
  &:hover {
    background-color: #1976d2 !important;
    color: #ffffff !important;
  }
}

.hover-bg-primary:hover {
  background-color: #1976d2 !important;
}
.hover-bg-danger:hover {
  background-color: #f44336 !important;
}

.delete-btn {
  &:hover {
    background-color: #f44336 !important;
    color: #ffffff !important;
  }
}
</style>

<style lang="scss">
.confirm-dialog {
  .q-btn:hover {
    .block {
      color: #ffffff;
    }
  }
  .ok-btn:hover {
    background-color: #f44336;
  }

  .cancel-btn:hover {
    background-color: #1976d2;
  }
}
</style>
