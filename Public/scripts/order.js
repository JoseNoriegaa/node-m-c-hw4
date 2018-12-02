let loading = false;
// table container
const table = document.getElementById('orderTable');

const groupItems = (items) => {
  const groupData = [];
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    const itemIdx = groupData.findIndex(x => x.product.id === element.product.id);
    if (itemIdx > -1) {
      groupData[itemIdx].quantity++;
    } else {
      groupData.push({ product: element.product, quantity: element.quantity });
    }
  }
  return groupData;
}
/**
 * This function render a table with all the products that the user has in his order.
 */
const renderTableRows = () => {
  if (app.state.order.user) {
    const items = groupItems(app.state.order.items);
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      const tr = document.createElement('tr');
      
      const tdProduct = document.createElement('td');
      const productElement = document.createElement('div');
      productElement.className = 'productImage';
      productElement.style = `background-image: url('${element.product.urlImage}')`;
      tdProduct.appendChild(productElement);
      tr.appendChild(tdProduct);
      
      const tdQuantity = document.createElement('td');
      tdQuantity.innerText = element.quantity;
      tr.appendChild(tdQuantity);
      
      const tdPrice = document.createElement('td');
      tdPrice.innerText = `$ ${element.product.price} ${element.product.currency.toUpperCase()}`;
      tr.appendChild(tdPrice);
      
      const tdTotal = document.createElement('td');
      tdTotal.innerText = `$ ${element.product.price * element.quantity} ${element.product.currency.toUpperCase()}`;
      tr.appendChild(tdTotal);

      const tdOp = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.setAttribute('type', 'text');
      deleteBtn.textContent = 'Delete'
      deleteBtn.onclick = deleteItem.bind(element.product);
      tdOp.appendChild(deleteBtn);
      tr.appendChild(tdOp);

      table.appendChild(tr);
    }
    const tr = document.createElement('tr');
    const tdText = document.createElement('td');
    tdText.setAttribute('colspan', 3);
    tdText.innerText = 'Total';
    const tdVal = document.createElement('td');
    tdVal.setAttribute('colspan', 1);
    tdVal.innerText = `$ ${items.reduce((prev, x) => prev + (x.product.price * x.quantity), 0)} MXN`;
    tr.appendChild(tdText);
    tr.appendChild(tdVal);
    table.appendChild(tr);
  }
}
/**
 * Delete a product item in the order
 */
async function deleteItem() {
  if (this.id) {
    const op = await app.orderDeleteItem(this.id);
    console.log(this.name + ' has been deleted');
    if (op) {
      window.location.reload();
    }
  }
}
/**
 * Payment handler
 */
async function pay() {
  if (!loading && app.state.auth.id && validate()) {
    const spinner = document.getElementById('spinner');
    const btn = document.getElementById('paymentBtn');
    const token = document.getElementById('stripeToken').value;
    btn.disabled = true;
    spinner.className += ' active';
    loading = true;
    const op = await app.pay(token);
    spinner.className = spinner.className.replace(/ active/g, '');
    isLoading = false;
    btn.disabled = false;
    if (op) {
      console.log('payment info', op);      
    } else {
      console.log('Payment error');
    }
  }
}
/**
 * Check up that all fields in the form are valid.
 */
function validate() {
  let valid = true;
  const token = document.getElementById('stripeToken').value;
  const tokenError = document.getElementById('stripeTokenError');
  // reset errors
  tokenError.innerText = '';
  tokenError.style = 'display: none';
  if (!token.trim()) {
    tokenError.style = 'display: block';
    tokenError.innerText = 'Required Field';
    valid = false;
  } else if (!/tok_/.test(token)) {
    tokenError.style = 'display: block';
    tokenError.innerText = 'Invalid token';
    valid = false;
  }
  return valid;
}

setTimeout(() => {
  renderTableRows();
}, 100);

// Check up if the user is already autenticated
setInterval(() => {
  if (!app.state.auth.id || app.state.order.items.length <= 0) {
    window.location = '/';
  }
}, 200);
