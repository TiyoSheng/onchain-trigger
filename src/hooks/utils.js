import { useMessage } from 'naive-ui'

export const useUtils = () => {
  const message = useMessage();
  const copy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
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