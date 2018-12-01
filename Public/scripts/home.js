const renderItems = (items) => {
  const productsContainer = document.getElementsByClassName('productsGrid')[0];
  for (let i = 0; i < items.length; i++) {
    const element = document.createElement('div');
    const innerElment = document.createElement('div');
    innerElment.className = 'add';
    innerElment.innerHTML = `$ ${items[i].price} ${items[i].currency.toUpperCase()}`;
    element.className = 'productContainer';
    element.style = `background-image: url('${items[i].urlImage}')`;
    element.appendChild(innerElment);
    element.onclick = onClickItem.bind(items[i]);
    productsContainer.appendChild(element);
  }
}
async function onClickItem(prod) {
  if (this.id) {
    const op = await app.orderAddItem(this.id, 1);
    if (!op) {
      window.location = '/login';
    } else {
      console.log('product added');
    }
  }
};
setTimeout(async () => {
  if (await app.getProducts()) {
    renderItems(app.state.products);
  }
}, 100);