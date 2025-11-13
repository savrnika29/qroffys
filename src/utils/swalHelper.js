import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const defaultSwal = Swal.mixin({
  confirmButtonColor: 'linear-gradient(90deg, #f73973 0%, #feac01 100%)', //Button color
  buttonsStyling: true
})

export const showLoginAlert = (type = 'info', message = '', options = {}) => {
  return Swal.fire({
    icon: type, // 'success' | 'error' | 'warning' | 'info' | 'question'
    title: message,
    confirmButtonText: 'Continue',
    showConfirmButton: true,
    confirmButtonColor: '#f73973',
    timer: undefined,
    didOpen: () => {
      const titleEl = Swal.getTitle()
      if (titleEl) {
        titleEl.style.fontSize = '22px'
        titleEl.style.color = '#282828'
      }
    },
    ...options
  })
}

export const showAlert = (type = 'info', message = '', options = {}) => {
  // type: 'success' | 'error' | 'warning' | 'info' | 'question'
  return Swal.fire({
    icon: type,
    title: message,
    confirmButtonText: 'OK',
    showConfirmButton: true,
    confirmButtonColor: '#f73973',
    // timer: 2000,
    // timerProgressBar: true,
    didOpen: () => {
      const titleEl = Swal.getTitle()
      if (titleEl) {
        titleEl.style.fontSize = '22px'
        titleEl.style.color = '#282828'
      }
    },
    ...options
  })
}

// show a confirm dialog and return true if user confirmed
export const showConfirm = (title = 'Are you sure?', text = '') => {
  return defaultSwal
    .fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then(res => res.isConfirmed)
}

// show custom image (if you want the big coin icon style)
export const showImageAlert = (imageUrl, title = '', opts = {}) => {
  return defaultSwal.fire({
    imageUrl,
    imageWidth: 120,
    imageHeight: 120,
    imageAlt: title,
    title,
    confirmButtonText: 'OK',
    ...opts
  })
}

export const showPayAlert = (type = 'info', message = '', options = {}) => {
  // type: 'success' | 'error' | 'warning' | 'info' | 'question'
  return Swal.fire({
    icon: null,
    title: message,
    confirmButtonText: 'Continue',
    showConfirmButton: true,
    // confirmButtonColor: "#f73973",
    customClass: {
      confirmButton: 'swal-gradient-btn'
    },
    // timer: 2000,
    // timerProgressBar: true,
    didOpen: () => {
      const titleEl = Swal.getTitle()
      if (titleEl) {
        titleEl.style.fontSize = '22px'
        titleEl.style.color = '#282828'
      }
    },
    ...options
  })
}
export const deleteAlert = (title, text, icon = "warning") => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: "Yes",
    confirmButtonColor: "#f73973",
    cancelButtonText: "Cancel",
  });
};
