import localforage from "localforage";
localforage.config({
  name: 'Trigger'
});
export const getLs = (itemName) => {
  return new Promise((resolve) => {
    localforage.getItem(itemName).then(value => {
      if (value !== null) {
        resolve(value)
      } else {
        resolve(null)
      }
    }).catch(() => {
      resolve(null)
    })
  })
}

export const setLs = (itemName, data) => {
  return new Promise((resolve, reject) => {
    localforage.setItem(itemName, data).then((value) => {
      resolve(value)
    }).catch((err) => {
      reject(err)
    });
  })
}