import { post } from './axios'

export const shareTrigger = (data = {}) => post('/dash/share_trigger', data)
export const getTrigger = (data = {}) => post('/dash/get_onchain_trigger', data)

//登录
export const login = (data = {}) => post('/dash/login', data)

// 注册
export const regist = (data = {}) => post('/dash/regist', data)