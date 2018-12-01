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
  }
}
async function deleteItem() {
  if (this.id) {
    const op = await app.orderDeleteItem(this.id);
    console.log(this.name + ' has been deleted');
    if (op) {
      window.location = '/order';
    }
  }
}
setTimeout(() => {
  renderTableRows();
}, 100);

// Check up if the user is already autenticated
setInterval(() => {
  if (!app.state.auth.id) {
    window.location = '/';
  }
}, 200);
