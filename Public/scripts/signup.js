let isLoading = false;

const signUpHandler = async (e) => {
  try {
    if (!isLoading && validate()) {
      const spinner = document.getElementById('spinner');
      const btn = document.getElementById('loginBtn');
      // username field
      const username = document.getElementById("usernameInput").value;
      // password field
      const password =  document.getElementById("passwordInput").value;
      btn.disabled = true;
      spinner.className += ' active';
      isLoading = true;

      // const response = await app.login(username, password);
      // if (response) {
      //   console.log('Loggedin');
      // } else {
      //   console.log('something went wrong');
      // }
      spinner.className = spinner.className.replace(/ active/g, '');
      isLoading = false;
      btn.disabled = false;
    }
  } catch (error) {
    console.error({error});
  }
}

const validate = () => {
  let valid = true;
  // username field
  const username = document.getElementById("usernameInput").value;
  const usernameError = document.getElementById("usernameError");
  // fullname field
  const fullname =  document.getElementById("fullnameInput").value;
  const fullnameError = document.getElementById("fullnameError");
  // email field
  const email =  document.getElementById("emailInput").value;
  const emailError = document.getElementById("emailError");
  // address field
  const address =  document.getElementById("addressInput").value;
  const addressError = document.getElementById("addressError");
  // password field
  const password =  document.getElementById("passwordInput").value;
  const passwordError = document.getElementById("passwordError");
  // password field
  const cfrmpassword =  document.getElementById("cfrmpasswordInput").value;
  const cfrmpasswordError = document.getElementById("cfrmpasswordError");
  // Reset errors
  usernameError.style = 'display:none';
  usernameError.innerText = '';

  passwordError.style = 'display:none';
  passwordError.innerText = '';

  fullnameError.style = 'display: none';
  fullnameError.innerText = '';

  emailError.style = 'display: none';
  emailError.innerText = '';

  addressError.style = 'display: none';
  addressError.innerText = '';

  cfrmpasswordError.style = 'display: none';
  cfrmpasswordError.innerText = '';

  if (!username.trim()) {
    usernameError.style = 'display: block';
    usernameError.innerText = 'Required Field';
    valid = false;
  }
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
};
// Check up if the user is already autenticated
setInterval(() => {
  if (app.state.auth.id) {
    window.location = '/';
  }
}, 200);
