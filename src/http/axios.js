import axios from 'axios';
let baseURL = 'https://rpc.jetable.xyz'
axios.defaults.timeout = 90000;

//http request 拦截器
axios.interceptors.request.use(
  config => {
    config.data = JSON.stringify(config.data);
    config.headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

//响应拦截器即异常处理
axios.interceptors.response.use(response => {
    return response
}, err => {
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
            console.log('错误请求')
          break;
        case 401:
            console.log('未授权，请重新登录')
            window.location.href = '/login'
          break;
        case 403:
          console.log('拒绝访问')
          break;
        case 404:
          console.log('请求错误,未找到该资源')
          break;
        case 405:
          console.log('请求方法未允许')
          break;
        case 408:
          console.log('请求超时')
          break;
        case 422:
          window.location.href = '/login'
          break;
        case 500:
          console.log('服务器端出错')
          break;
        case 501:
          console.log('网络未实现')
          break;
        case 502:
          console.log('网络错误')
          break;
        case 503:
          console.log('服务不可用')
          break;
        case 504:
          console.log('网络超时')
          break;
        case 505:
          console.log('http版本不支持该请求')
          break;
        default:
          console.log(`连接错误${err.response.status}`)
      }
    } else {
      console.log('连接到服务器失败')
    }
    return Promise.resolve(err.response)
})


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export const post = (url, data = {}) => {
  url = `${baseURL}${url}`
  return new Promise((resolve,reject) => {
    axios.post(url, data).then(response => {
      resolve(response.data);
    }, err => {
      reject(err)
    })
  })
 }


export const get = (url, params = {}) => {
  url = `${baseURL}${url}`
  return new Promise((resolve,reject) => {
    axios.get(url, {params}).then(response => {
      resolve(response.data)
    }).catch(err => {
      reject(err)
    })
  })
}