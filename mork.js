triggers = [{
  id: 1,
  name: '触发器1',
  // 执行函数
  functions: [{
    contractId: '',
    args: {arg1: {value: '1', type: ''}, arg2: {value: '2', type: 'contract'}},
    functionName: '',
    id: '',
    name: ''
  }],
  // 全局变量
  globalParams: [{key: 'key1', value: 'value1'}],
  // 流程
  flows: [{
    id: 1,
    name: '流程1',
    // 执行函数
    handdleList: [{
      type: 'contract',
      contractId: '',
      args: {arg1: {value: '1', type: ''}, arg2: {value: '2', type: 'contract'}},
      functionName: '',
      id: '',
      name: ''
    }, {
      type: 'http',
      url: '',
      method: 'get',
      args: {arg1: {value: '1', type: ''}, arg2: {value: '2', type: 'contract'}},
      headers: {arg1: {value: '1', type: ''}, arg2: {value: '2', type: 'contract'}},
      id: '',
      name: ''
    }],
  }],
  // 触发器
  triggers: [{
    id: 1,
    name: '触发器1',
    contractId: '',
    filter: {arg1: {value: '1', condition: '$eq', type: 'http'}},
    handdleList: [{
      args: {arg1: {value: '1', condition: '$eq', type: 'http'}},
      contractId: '',
      functionName: '',
      id: '',
      name: '',
    }]
  }],
  remark: {
    trigger: '触发器备注',
    flow: '流程备注1',
    function: '函数备注1',
    globalParam: '全局变量备注1',
  },
}]