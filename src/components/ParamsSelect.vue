<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../hooks/globalStore'
import { useUtils } from '../hooks/utils'
import AddParams from '../components/form/AddParams.vue'

const { store, setTriggrts } = useGlobalStore()
const { resetGlobalParams } = useUtils()
const emit = defineEmits(['update', 'addParamsSuccess'])
const props = defineProps({
  value: String,
  params: Array
})

const addParams = ref(null)
const selectValue = ref('')

const addParamsSuccess = async (e) => {
  console.log(e)
  let triggrts = store.state.triggers
  let activatedId = store.state.activatedId
  let triggerData = triggrts.find(item => item.id === activatedId)
  let index = triggrts.findIndex(item => item.id === activatedId)
  triggerData.globalParams = e
  triggrts[index] = triggerData
  await setTriggrts(triggrts)
  let params = resetGlobalParams(triggerData)
  let item = e[e.length - 1]
  item.label = `${item.key} (${item.value})`
  item.type = 'param'
  let res = {}
  res.value = item.key
  res.type = item.type
  console.log(res)
  emit('update', res)
  emit('addParamsSuccess', params)
}

const addParamsFun = () => {
  addParams.value.showAddModal = true
}

const update = () => {
  let val = selectValue.value
  let res = {}
  res.value = val
  if (val) {
    let param = props.params.find(item => item.key === val)
    if (param) {
      res.type = param.type
    } else {
      res.type = 'var'
    }
  }
  emit('update', res)
}

watch(() => props.value, (val) => {
  selectValue.value = val
}, { immediate: true })

</script>

<template>
  <n-select v-model:value="selectValue" filterable tag :options="props.params" label-field="label" value-field="key"
    placeholder="Input or Select" @update:value="update">
    <template #action>
      <p @click="addParamsFun('daiAddress')" class="add-new-btn">新增全局变量</p>
    </template>
  </n-select>
  <AddParams ref="addParams" @handleOk="addParamsSuccess" />
</template>