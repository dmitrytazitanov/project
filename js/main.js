'use strict';
const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';



/**
 * Описываем базовые классы
 */
class List {
    constructor(url, container){
        this.container = container;
        this.url = url;
        this.goods = [];
        this.allProducts = [];
        this._init();
    }

    /**
     * получение данных с сервера
     * @param url
     * @returns {Promise<any | never>}
     */
    getJson(url){
        return fetch(url ? url : `${API + this.url}`)
        .then(result => result.json())
        .catch(error => {
            console.log(error);
        })
    }
    /**
     * обработка полученных данных
     * @param data
     */
    handleData(data){
        this.goods = data;
        this.render();
    }

    /**
     * подсчет стоимости всех товаров
     * @returns {*|number}
     */
    calcSum(){
        return this.allProducts.reduce((accum, item) => accum += item.price, 0);
    }
    render(){
        const block = document.querySelector(this.container);
        for (let product of this.goods){
        console.log(this.constructor.name);

        let productObj = null;
        if (this.constructor.name === 'ProductsList') productObj = new ProductItem(product);
        if (this.constructor.name === 'Cart') productObj = new CartItem(product);
        if (!productObj) return;

        console.log(productObj);
        this.allProducts.push(productObj);
        block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }


    _init(){
        return false
    }
}

class Item{
    constructor(el, img = 'https://via.placeholder.com/200x150'){
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.img = img;
    }
    render(){
        return ``;
    }
}

/**
   * Наследуемся от базовых классов
   */
class ProductsList extends List{
    constructor(cart, container = '.products', url = "/catalogData.json"){
        super(url, container);
        this.cart = cart;
        this.getJson()
        .then(data => this.handleData(data));
    }

    _init(){
        document.querySelector(this.container).addEventListener('click', e => {
        if(e.target.classList.contains('buy-btn')){
            this.cart.addProduct(e.target);
            }
        });
    }
}

class ProductItem extends Item{
    render() {
        return `<div class="product-item" data-id="${this.id_product}">
                    <img src="${this.img}" alt="Some img">
                    <div class="desc">
                        <h3>${this.product_name}</h3>
                        <p>${this.price} ₽</p>
                        <button class="buy-btn"
                        data-id="${this.id_product}"
                        data-name="${this.product_name}"
                        data-price="${this.price}">Купить</button>
                    </div>
                </div>`;
    }
}

class Cart extends List{
    constructor(container = ".cart-block", url = "/getBasket.json"){
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.contents);
            });
    }

    /**
     * добавление товара
     * @param element
     */
    addProduct(element){
        this.getJson(`${API}/addToBasket.json`)
            .then(data => {
            if(data.result === 1){
                let productId = +element.dataset['id'];
                let find = this.allProducts.find(product => product.id_product === productId);
            if(find){
                find.quantity++;
                this._updateCart(find);
            } else {
                let product = {
                    id_product: productId,
                    price: +element.dataset['price'],
                    product_name: element.dataset['name'],
                    quantity: 1
                };
                this.goods = [product];
                this.render();
            }
            } else {
            alert('Error');
            }
        })
    }

    /**
     * удаление товара
     * @param element
     */
    removeProduct(element){
        this.getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
            if(data.result === 1){
                let productId = +element.dataset['id'];
                let find = this.allProducts.find(product => product.id_product === productId);
                if(find.quantity > 1){
                find.quantity--;
                this._updateCart(find);
                } else {
                this.allProducts.splice(this.allProducts.indexOf(find), 1);
                document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                }
            } else {
                alert('Error');
            }
        })
    }
    
    /**
     * обновляем данные корзины
     * @param product
     * @private
     */
    _updateCart(product){
        let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
        block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
        block.querySelector('.product-price').textContent = `${product.quantity * product.price} ₽`;
    }
    _init(){
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if(e.target.classList.contains('del-btn')){
                this.removeProduct(e.target);
            }
        })
    }
}

class CartItem extends Item{
    constructor(el, img = 'https://via.placeholder.com/50x100'){
        super(el, img);
        this.quantity = el.quantity;
    }
    render(){
        return `<div class="cart-item" data-id="${this.id_product}">
                    <div class="product-bio">
                    <img src="${this.img}" alt="Some image">
                    <div class="product-desc">
                    <p class="product-title">${this.product_name}</p>
                    <p class="product-quantity">Количество: ${this.quantity}</p>
                <p class="product-single-price">${this.price} за ед.</p>
                </div>
                </div>
                <div class="right-block">
                    <p class="product-price">${this.quantity*this.price} ₽</p>
                    <button class="del-btn" data-id="${this.id_product}">&times;</button>
                </div>
                </div>`
    }
}



let cart = new Cart();
let products = new ProductsList(cart);

// do not use fetch!! Only Promise!
/* let getRequest = (url) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200) {
                    reject('Error!');
                } else {
                    resolve(xhr.responseText);
                }
            }
        };
        xhr.send();
    })
};
 */

/* class ProductItem {
    constructor(product, img='https://via.placeholder.com/200x150') { // img = './img/img.jpg'
        this.name = product.product_name;
        this.price = product.price;
        this.id = product.id_product;
        this.img = img;
    }

    getHTMLString() {
        return `<div class="product-item" data-id="${this.id}">
                    <img src="${this.img}" alt="Some img">
                    <div class="desc">
                        <h3>${this.name}</h3>
                        <p>${this.price} \u20bd</p>
                        <button class="buy-btn">Купить</button>
                    </div>
                </div>`;
    }
}

class ProductList {
    constructor(container = '.products') {
        // this.container = container;
        this.container = document.querySelector(container);
        this._goods = [];
        this._allProducts = [];

        // this._fetchGoods();
        // this._render();
        this._getProducts().then((data) => {
            this._goods = data;
            this._render();
        });
    }

    // _fetchGoods() {
    //   getRequest(`${API}/catalogData.json`, (data) => {
    //     this._goods = JSON.parse(data);
    //     this._render();
    //     // console.log(this._goods);
    //   });
    // }

    sum() {
        // return this._goods.reduce((sum, { price }) => sum + price, 0);
        return this._goods.reduce(function (sum, good) {
            return sum + good.price;
        }, 0);
    }

    _getProducts() {
        return fetch(`${API}/catalogData.json`)
            .then(response => response.json())
            .catch((error) => {
                console.log(error)
        });
    }

    _render() {
        // const block = document.querySelector(this.container);

        for (const product of this._goods) {
            const productObject = new ProductItem(product);
            this._allProducts.push(productObject);
            // block.insertAdjacentHTML('beforeend', productObject.getHTMLString());
            this.container.insertAdjacentHTML('beforeend', productObject.getHTMLString());
        }
    }
}

new ProductList();

 */

/* 'use strict';
class ProductItem {
    constructor(product, img='https://via.placeholder.com/200x150') { // img = './img/img.jpg'
        this.title = product.title;
        this.price = product.price;
        this.id = product.id;
        this.img = img;
    }

    getHTMLString() {
        return `<div class="product-item" data-id="${this.id}">
                    <img src="${this.img}" alt="Some img">
                    <div class="desc">
                        <h3>${this.title}</h3>
                        <p>${this.price} \u20bd</p>
                        <button class="buy-btn">Купить</button>
                    </div>
                </div>`;
    }
}

class ProductList {
    constructor(container = '.products') {
        this.container = document.querySelector(container);
        this._goods = [];
        this._allProducts = [];

        this._fetchGoods();
        this._render();
    }

    _fetchGoods() {
        this._goods = [
            {id: 1, title: 'Notebook', price: 20000},
            {id: 2, title: 'Mouse', price: 1500},
            {id: 3, title: 'Keyboard', price: 5000},
            {id: 4, title: 'Gamepad', price: 4500},
        ];
    }

    calculate() {
        return this._goods.reduce(function (calculate, good) {
            return calculate + good.price;
        }, 0);
    }

    _render() {
        for (const product of this._goods) {
            const productObject = new ProductItem(product);
            this._allProducts.push(productObject);
            this.container.insertAdjacentHTML('beforeend', productObject.getHTMLString());
        }
    }
}

const list = new ProductList();


class Basket{
//класс для корзины
};
class ProductInBasket{
//класс для товара в корзине
}; */

/* const products = [
    {id: 1, title: 'Notebook', price: 20000},
    {id: 2, title: 'Mouse', price: 1500},
    {id: 3, title: 'Keyboard', price: 5000},
    {id: 4, title: 'Gamepad', price: 4500},
];

const renderProduct = (item, img='https://via.placeholder.com/200x150') => `<div class="product-item" data-id="${this.id}">
                                                                                <img src="${img}" alt="Some img">
                                                                                <div class="desc">
                                                                                    <h3>${item.title}</h3>
                                                                                    <p>${item.price} \u20bd</p>
                                                                                    <button class="buy-btn">Купить</button>
                                                                                </div>
                                                                            </div>`;
 */
/* const renderProducts = list => {
document.querySelector('.products').insertAdjacentHTML('beforeend', list.map(item => renderProduct(item)).join(''));
};

renderProducts(products); */


