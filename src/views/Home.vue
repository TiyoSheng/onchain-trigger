<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalStore } from '../hooks/globalStore'
import AddContract from '../components/form/AddContract.vue'
import AddTrigger from '../components/form/CreateTrigger.vue'
import TriggerDetail from '../components/TriggerDetail.vue'
import Password from '../components/form/Password.vue'
import Nav from '../components/Nav.vue'
import Msgs from '../components/Msgs.vue'
import { useMessage, useDialog } from "naive-ui"
import { getTrigger, getTriggerInfo } from '../http/api'

const { store, setActivatedId, setTriggrts, setContracts } = useGlobalStore()
const message = useMessage()
const dialog = useDialog()
const route = useRoute()
const router = useRouter()

const addContractRef = ref(null)
const passwordRef = ref(null)
const addTriggerRef = ref(null)
const popconfirmRef = ref(null)
const contractPopconfirmRef = ref(null)
const isSpin = ref(false)

const id = route.params.id

onBeforeMount(() => {
  if (id) {
    getTriggerFun()
  }
})

const submit = (val) => {
  isSpin.value = true
  let data = {
    trigger_id: id
  }
  if (val) {
    data.password = val
    data.share_type = 'password'
  } else {
    data.share_type = 'playground'
  }
  getTrigger(data).then(async res => {
    console.log(res)
    if (res.code == 0) {
      let contracts = store.state.contracts
      let newContracts = JSON.parse(JSON.stringify(res.trigger.contracts))
      let trigger = JSON.parse(JSON.stringify(res.trigger))
      trigger.id = trigger.trigger_id
      trigger.flows = trigger.flow
      trigger.password = data.password
      trigger.isImport = true
      delete trigger.flow
      delete trigger.contracts
      let triggers = store.state.triggers
      // findtrigger
      console.log('findtrigger', triggers)
      if (triggers.find(item => item.trigger_id == trigger.trigger_id)) {
        isSpin.value = false
        await setActivatedId(trigger.id)
        router.replace({
          path: '/'
        })
        return
      }
      // 根据id 去重
      contracts.push(...newContracts)
      let newContractsArr = []
      let obj = {}
      for (let i = 0; i < contracts.length; i++) {
        if (!obj[contracts[i].id]) {
          newContractsArr.push(contracts[i])
          obj[contracts[i].id] = 1
        }
      }
      triggers.push(trigger)
      await setTriggrts(triggers)
      await setContracts(newContractsArr)
      await setActivatedId(trigger.id)

      router.replace({
        path: '/'
      })
    } else {
      message.error(res.msg)
    }
    isSpin.value = false
  }).catch(err => {
    isSpin.value = false
  })
}

const getTriggerFun = () => {
  isSpin.value = true
  getTriggerInfo({
    trigger_id: id
  }).then(res => {
    console.log(res)
    isSpin.value = false
    if (res.code == 0) {
      let shareType = res.trigger.share_type
      if (shareType == 'password') {
        passwordRef.value.showAddModal = true
      } else {
        submit()
      }
    }
  }).catch(err => {
    isSpin.value = false
  })
  // getTrigger()
}

const showModal = (type, item) => {
  if (type == 'contract') {
    addContractRef.value.showAddModal = true
    if (item) {
      addContractRef.value.isEdit = true
      addContractRef.value.contractData = Object.assign({}, item)
    }
  } else if (type == 'trigger') {
    addTriggerRef.value.showAddModal = true
  }
}

const cancel = (type) => {
  if (type == 'contract') {
    contractPopconfirmRef.value.forEach(e => {
      e.setShow(false)
    })
  } else {
    console.log(popconfirmRef.value)
    popconfirmRef.value.forEach(e => {
      e.setShow(false)
    })
  }
}

const delContractItem = async (index) => {
  let contracts = store.state.contracts
  contracts.splice(index, 1)
  await setContracts(contracts)
  message.success('删除成功')
  cancel()
}

const editTriggerItem = async (index) => {
  let triggers = store.state.triggers
  let trigger = triggers[index]
  addTriggerRef.value.showAddModal = true
  addTriggerRef.value.triggerData = JSON.parse(JSON.stringify(trigger))
  
}

const delTriggerItem = async (index) => {
  let triggers = store.state.triggers
  let activatedId = store.state.activatedId
  let isActived = activatedId == triggers[index].id ? true : false
  triggers.splice(index, 1)
  await setTriggrts(triggers)
  if (isActived) {
    if (triggers.length > 0) {
      await setActivatedId(triggers[index - 1].id)
    } else {
      await setActivatedId('')
    }
  }
  message.success('删除成功')
}

const changeMenu = async (id) => {
  await setActivatedId(id)
}

</script>
<template>
<div>
  <n-spin size="small" :show="isSpin">
    <n-layout class="layout">
      <Nav />
      <n-layout class="layout-body" has-sider>
        <n-layout-sider
          class="layout-sider"
          content-style="padding: 16px 8px;"
          :native-scrollbar="false"
          width="200px"
          bordered
          v-if="!store.state.isIframe"
        >
          <div class="menu">
            <div class="menu-hd flex-center-sb">Trigger列表
              <n-popover placement="right" style="width: auto;background: rgba(6, 30, 85, 0.9);backdrop-filter: blur(2.5px);color:#FFF"
              :arrow-style="{background: 'rgba(6, 30, 85, 0.9)', 'backdrop-filter': 'blur(2.5px)'}">
                <template #trigger>
                  <svg @click="showModal('trigger')" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H13" stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 13L8 3" stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
                Add Trigger
              </n-popover>
            </div>
            <div class="menu-bd">
              <div class="menu-item flex-center-sb" :class="{'menu-item-actived': item.id == store.state.activatedId}" v-for="(item, index) in store.state.triggers" :key="item.i " @click="changeMenu(item.id)">{{item.name}}
                <div class="flex-center">
                  <svg @click="editTriggerItem(index)" class="del-icon" t="1683120057177" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2734" id="mx_n_1683120057178" width="16" height="16"><path d="M791.582118 463.269647c-5.150118-8.914824-14.546824-15.179294-25.750588-15.179294-11.173647 0-20.540235 6.234353-25.720471 15.058824-2.680471-0.692706-4.336941-0.060235-4.336941 4.487529l0 293.044706c0 21.534118-17.980235 39.062588-40.026353 39.062588L235.580235 799.744c-22.046118 0-40.026353-17.528471-40.026353-39.062588 0 0 0-507.934118 0-527.480471 0-21.564235 17.950118-39.062588 40.026353-39.062588L595.727059 194.138353c2.288941 0 3.463529-0.451765 4.156235-1.144471 1.957647 0.391529 3.794824 1.144471 5.842824 1.144471 16.564706 0 30.027294-13.131294 30.027294-29.304471 0-16.173176-13.462588-29.304471-30.027294-29.304471-2.409412 0-4.517647 0.813176-6.806588 1.325176C598.196706 136.041412 597.142588 135.529412 595.727059 135.529412L215.582118 135.529412C171.429647 135.529412 135.529412 170.586353 135.529412 213.684706l0 566.543059c0 43.098353 35.900235 78.155294 80.052706 78.155294l500.224 0c44.152471 0 80.022588-35.056941 80.022588-78.155294L795.828706 467.636706C795.828706 465.106824 794.142118 463.841882 791.582118 463.269647zM848.203294 144.986353c-12.438588-10.691765-31.412706-9.517176-42.375529 2.620235L342.949647 660.720941c-10.962824 12.137412-9.758118 30.659765 2.680471 41.351529 12.438588 10.691765 31.412706 9.517176 42.375529-2.620235l462.908235-513.084235C861.816471 174.230588 860.641882 155.678118 848.203294 144.986353z" fill="#4C4F53" p-id="2735"></path></svg>
                  <n-popconfirm :show-icon="false" @click.stop ref="popconfirmRef">
                    <template #trigger>
                      <svg class="del-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </template>
                    <template #action>
                      <div class="del-btns flex-center">
                        <div class="btn-no flex-center-center" @click.stop="cancel('')">取消</div>
                        <div class="btn-yes flex-center-center" @click.stop="delTriggerItem(index)">确认</div>
                      </div>
                    </template>
                    <div class="flex-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8.00008" cy="8.00002" r="7.33333" fill="#F98080"/>
                        <path d="M5.27783 5.27777L10.7223 10.7222" stroke="white" stroke-linejoin="round"/>
                        <path d="M10.7222 5.27777L5.27772 10.7222" stroke="white" stroke-linejoin="round"/>
                      </svg>
                      <span style="margin-left: 8px">确认删除【{{item.name}}】？</span>
                    </div>
                  </n-popconfirm>
                </div>
              </div>
            </div>
            <div class="menu-hd flex-center-sb">Contract列表
              <n-popover placement="right" style="width: auto;background: rgba(6, 30, 85, 0.9);backdrop-filter: blur(2.5px);color:#FFF"
              :arrow-style="{background: 'rgba(6, 30, 85, 0.9)', 'backdrop-filter': 'blur(2.5px)'}">
                <template #trigger>
                  <svg @click="showModal('contract')" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H13" stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 13L8 3" stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
                Add Contract
              </n-popover>
            </div>
            <div class="menu-bd">
              <div class="menu-item flex-center-sb" v-for="(item, index) in store.state.contracts" :key="item.id" @click="showModal('contract', item)">{{item.name}}
                <n-popconfirm :show-icon="false" @click.stop ref="contractPopconfirmRef">
                  <template #trigger>
                    <svg @click.stop class="del-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </template>
                  <template #action>
                    <div class="del-btns flex-center">
                      <div class="btn-no flex-center-center" @click.stop="cancel('contract')">取消</div>
                      <div class="btn-yes flex-center-center" @click.stop="delContractItem(index)">确认</div>
                    </div>
                  </template>
                  <div class="flex-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8.00008" cy="8.00002" r="7.33333" fill="#F98080"/>
                      <path d="M5.27783 5.27777L10.7223 10.7222" stroke="white" stroke-linejoin="round"/>
                      <path d="M10.7222 5.27777L5.27772 10.7222" stroke="white" stroke-linejoin="round"/>
                    </svg>
                    <span style="margin-left: 8px">确认删除【{{item.name}}】？</span>
                  </div>
                </n-popconfirm>
              </div>
            </div>
          </div>
        </n-layout-sider>
        <n-layout :native-scrollbar="false">
          <div class="flex-start" :style="{border: store.state.isIframe ?  '1px solid #EEEFF0' : 'none'}">
            <TriggerDetail @createTrigger="showModal('trigger')" />
            <Msgs />
          </div>
        </n-layout>
      </n-layout>
    </n-layout>
  </n-spin>
  <AddContract ref="addContractRef" />
  <AddTrigger ref="addTriggerRef" />
  <Password ref="passwordRef" @submit="submit" />
</div>
  
</template>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  .layout-body {
    position: absolute;
    top: 64px;
    bottom: 0;
    right: 0;
    left: 0;
    .menu {
      height: 100%;
      display: flex;
      flex-direction: column;
      .menu-hd {
        height: 32px;
        padding: 0 16px;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        color: #9BA0A8;
        box-sizing: border-box;
        svg {
          cursor: pointer;
          &:hover {
            background: rgba(201, 209, 220, 0.2);
            border-radius: 2px;
          }
        }
      }
      .menu-bd {
        .menu-item {
          padding: 0px 16px;
          height: 32px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          color: #5C636B;
          &.menu-item-actived {
            color: #000;
            background: rgba(201, 209, 220, 0.4);
          }
          &:hover {
            background: rgba(201, 209, 220, 0.2);
            .del-icon {
              display: flex;
            }
          }
          .del-icon {
            display: none;
            &:hover {
              background: rgba(201, 209, 220, 0.35);
              border-radius: 2px;
            }
          }
        }
      }
    }
  }
}
.del-btns {
  justify-content: flex-end;
  margin-top: 4px;
  .btn-no {
    font-size: 13px;
    line-height: 18px;
    color: #262C33;
    width: 50px;
    height: 28px;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    cursor: pointer;
  }
  .btn-yes {
    margin-left: 8px;
    width: 50px;
    height: 28px;
    background: #F98080;
    border-radius: 6px;
    font-size: 13px;
    line-height: 18px;
    color: #FFFFFF;
    cursor: pointer;
  }
}
</style>