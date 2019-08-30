/**
 * Render the products available for the user.
 * @param {Array} items order items
 */
const renderItems = (items) => {
  const productsContainer = document.getElementsByClassName('productsGrid')[0];
  for (let i = 0; i < items.length; i++) {
    // create the root div
    const element = document.createElement('div');
    // create the child div
    const subElement = document.createElement('div');

    // sub-element style
    subElement.className = 'add';
    subElement.innerHTML = `$ ${items[i].price} ${items[i].currency.toUpperCase()}`;
    
    // root-element style
    element.className = 'productContainer';
    element.style = `background-image: url('${items[i].urlImage}')`;
    element.appendChild(innerElment);
    // onclick event handler
    element.onclick = onClickItem.bind(items[i]);
    // Add the root-element to container
    productsContainer.appendChild(element);
  }
}
/**
 * onclick event, add product to the order
 */
async function onClickItem() {
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
