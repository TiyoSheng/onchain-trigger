import { useMessage } from 'naive-ui'

export const useUtils = () => {
  const message = useMessage();
  const copy = (value) => {
    if (!navigator.clipboard || window.top != window.self) {
      let textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.style.position = 'fixed'
      textarea.style.clip = 'rect(0 0 0 0)'
      textarea.style.top = '10px'
      textarea.value = value
      textarea.select()
      document.execCommand('copy', true)
      document.body.removeChild(textarea)
    } else {
      navigator.clipboard.writeText(value)
    }
    message.success('Copy successful');
  };

  return {
    copy
  }
}


// export const useUtils = () => ({
//   copy
// });