
let isLoading = false;

const fillUserInfo = async () => {
  // username field
  const username = document.getElementById("usernameInput");
  // fullname field
  const fullname =  document.getElementById("fullnameInput");
  // email field
  const email =  document.getElementById("emailInput");
  // address field
  const address =  document.getElementById("addressInput");
  const info = await app.getUserInfo();
  if (info) {
    username.value = info.username;
    fullname.value = info.fullname;
    email.value = info.email;
    address.value = info.address;
  }
};

const updateUserInfo = async (e) => {
  try {
    if (!isLoading && validateInfoForm()) {
      const spinner = document.getElementById('spinnerInfo');
      const btn = document.getElementById('updateInfo');
      // username field
      const username = document.getElementById("usernameInput").value;
      // fullname field
      const fullname =  document.getElementById("fullnameInput").value;
      // email field
      const email =  document.getElementById("emailInput").value;
      // address field
      const address =  document.getElementById("addressInput").value;

      btn.disabled = true;
      spinner.className += ' active';
      isLoading = true;
      const response = await app.updateUserInfo(email, fullname, null, address);
      if (response) {
        window.location.reload(false);
      } else {
        console.log('something went wrong');
      }
      spinner.className = spinner.className.replace(/ active/g, '');
      isLoading = false;
      btn.disabled = false;
    }
  } catch (error) {
    console.error({error});
  }
}

const updateUserPwd = async (e) => {
  try {
    if (!isLoading && validatePasswordForm()) {
      const spinner = document.getElementById('spinnerPassword');
      const btn = document.getElementById('updatePassword');
      // password field
      const password =  document.getElementById("passwordInput").value;
      btn.disabled = true;
      spinner.className += ' active';
      isLoading = true;
      const response = await app.updateUserInfo(null, null, password, null);
      if (response) {
        console.log('password changed');
        window.location.reload(false);
      } else {
        console.log('something went wrong');
      }
      spinner.className = spinner.className.replace(/ active/g, '');
      isLoading = false;
      btn.disabled = false;
    }
  } catch (error) {
    console.error({error});
  }
}

const validateInfoForm = () => {
  let valid = true;
  // fullname field
  const fullname =  document.getElementById("fullnameInput").value;
  const fullnameError = document.getElementById("fullnameError");
  // email field
  const email =  document.getElementById("emailInput").value;
  const emailError = document.getElementById("emailError");
  // address field
  const address =  document.getElementById("addressInput").value;
  const addressError = document.getElementById("addressError");
  
  // Reset errors
  fullnameError.style = 'display: none';
  fullnameError.innerText = '';

  emailError.style = 'display: none';
  emailError.innerText = '';

  addressError.style = 'display: none';
  addressError.innerText = '';

 if (!fullname.trim()) {
    fullnameError.style = 'display: block';
    fullnameError.innerText = 'Required Field';
    valid = false;
  }
  if (!email.trim()) {
    emailError.style = 'display: block';
    emailError.innerText = 'Required Field';
    valid = false;
  }
  if (!address.trim()) {
    addressError.style = 'display: block';
    addressError.innerText = 'Required Field';
    valid = false;
  }
  return valid;
};
const validatePasswordForm = () => {
  let valid = true;
  // password field
  const password =  document.getElementById("passwordInput").value;
  const passwordError = document.getElementById("passwordError");
  // password field
  const cfrmpassword =  document.getElementById("cfrmpasswordInput").value;
  const cfrmpasswordError = document.getElementById("cfrmpasswordError");
  // Reset errors
  passwordError.style = 'display:none';
  passwordError.innerText = '';

  cfrmpasswordError.style = 'display: none';
  cfrmpasswordError.innerText = '';

  if (!cfrmpassword.trim()) {
    cfrmpasswordError.style = 'display: block';
    cfrmpasswordError.innerText = 'Required Field';
    valid = false;
  } else if (cfrmpassword !== password) {
    cfrmpasswordError.style = 'display: block';
    cfrmpasswordError.innerText = 'Passwords do not match.';
    valid = false;
  }
  if (!password.trim()) {
    passwordError.style = 'display: block';
    passwordError.innerText = 'Required Field';
    valid = false;
  }
  return valid;
}
setTimeout(async () => {
  await fillUserInfo();
}, 50);
// Check up if the user is already autenticated
setInterval(() => {
  if (!app.state.auth.id) {
    window.location = '/';
  }
}, 50);
