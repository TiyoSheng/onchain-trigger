import { post, get } from './axios'

export const shareTrigger = (data = {}) => post('/dash/share_trigger', data)
export const getTrigger = (data = {}) => post('/dash/get_onchain_trigger', data)
export const getTriggerInfo = (data = {}) => get('/dash/get_trigger_info', data)
export const getPlayground = (data = {}) => get('/dash/get_playground', data)

//登录
export const login = (data = {}) => post('/dash/login', data)

// 注册
export const regist = (data = {}) => post('/dash/regist', data)