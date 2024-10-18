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
        />
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
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
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

const userStore = useUserStore();
const $q = useQuasar();

interface btnType {
  label: string;
  icon: string;
  status: string;
}

const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
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

const blockData = ref([]);
function handleClickOption(btn, data) {
  // ...
}
onMounted(() => {
  fetchUserList();
});
const tempData = ref({
  name: '',
  age: '',
});

// Validate Reset
const nameRef = ref(null);
const nameRules = [
  (val) => !!val || '*必填',
  (val) => val.length <= 15 || '*限輸入15字',
];
const ageRef = ref(null);
const ageRules = [
  (val) => (val !== null && val !== '') || '*必填',
  (val) => (Number.isInteger(+val) && +val > 0) || '*限輸入數字(正整數)',
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
  nameRef.value.resetValidation();
  ageRef.value.resetValidation();
}

// Read
async function fetchUserList() {
  const status = await userStore.fetchUserList();
  if (status === 200) {
    blockData.value = userStore.userList;
  }
}

// Create
async function addUser() {
  const newUserData = {
    name: tempData.value.name,
    age: parseInt(tempData.value.age, 10),
  };

  const status = await userStore.createUser(newUserData);

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
</style>
