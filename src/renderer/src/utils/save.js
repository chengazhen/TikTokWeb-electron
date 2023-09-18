import axios from 'axios'
import FileSaver from 'file-saver'
export default (url, name, onProgress) => {
  axios
    .get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        onProgress(progressEvent.progress)
      }
    })
    .then((response) => {
      FileSaver.saveAs(response.data, name)
    })
}
