import {productsData}  from "./products.js";

const cartWrapper = document.querySelector(".cart__wrapper");
const cartQuantity = document.querySelector(".nav__quantity");
const confirmCartBtn = document.querySelector(".modal__confirm");
const clearCartBtn = document.querySelector(".modal__clear");
const showModal = document.querySelector(".nav__cart");
const modalBox = document.querySelector(".modal__box");
const backDrop = document.querySelector(".backdrop");
const totalPrice = document.querySelector(".modal__price"); 
const cartContent = document.querySelector(".modal__content");
const cartItem = document.querySelectorAll(".modal__items");


// modal:
showModal.addEventListener("click", showwModal); 
confirmCartBtn.addEventListener("click", closeModal);

function showwModal() {
    modalBox.style.opacity = "1";
    modalBox.style.transform = "translateY(20vh)"
    backDrop.style.display = "block";
}
function closeModal() {
    modalBox.style.opacity = "0";
    modalBox.style.transform = "translateY(-100vh)";
    backDrop.style.display = "none";
}
    

// classes:

// 1. get products
class Products {
    getProducts() {
        return productsData;
    }
};

// 2.display products
let cart = [];
let buttonsDom = [];
class UI {
  displayProducts(products){  
      let result = "";
      products.forEach(item => {
         result += `<div class="cart__item">
         <div class="cart__image">
             <img src=${item.imgUrl} alt="">
         </div>
         <div class="cart__desc">
             <p class="cart__price">${item.price}</p>
             <p class="cart__name">${item.title}</p>
         </div>
        <button class="cart__btn btn" data-id = ${item.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
        </button>  
     </div>`;
     cartWrapper.innerHTML = result;
      })
  };
  getAddToCartBtns(){
    const addtoCartBtn = [...document.querySelectorAll(".cart__btn")];
    buttonsDom = addtoCartBtn;
    
    addtoCartBtn.forEach(btn=> {
        const id = btn.dataset.id;
        const isInCart = cart.find(p => {
            p.id === id});
        if (isInCart) {
            btn.innerText = "In Cart";
            btn.disabled = true;
        }
        btn.addEventListener("click", (event) => {
            event.target.innerText = "In Cart";
            event.target.disabled = true;

            // get products from storage:
            const addedProduct = Storage.getProduct(id);
            
            // add to cart:
            cart = [...cart, {...addedProduct, quantity: 1}];

            // save cart to local storage:
            Storage.saveCart(cart);
            //  save buttons to local storage: 
            
            
            this.setCartValue(cart);

            // add to cart item(modal):
            this.addCartItem(cart);
            cart = [...cart];

            // save modal_item in local storage:
            Storage.saveModal(cart);
        })
    });
  };
  
  setCartValue(cart) {
    //   1.cart quantity
    //   2.cart total price
    let tempCartItems = 0;
    const price = cart.reduce((acc,curr) => {
        tempCartItems += curr.quantity;
        return acc + curr.quantity * parseInt(curr.price);
    },0);
    cartQuantity.innerText = tempCartItems;  
    totalPrice.innerText = `total price : ${price}$` ;
  };
  addCartItem(cartItem) {
      let content = "";
      cart.forEach((cart) => {
          content += `
          <div class="modal__items">
                    <div class="item__img">
                        <img src=${cart.imgUrl} alt="">
                    </div>
                    <div class="item__desc">
                        <p class="item__name">${cart.title}</p>
                        <p class="item__price">${cart.price}</p>
                    </div>
                    <div class="item__quantity">
                        <i class="fas fa-angle-up" data-id=${cart.id}></i>
                        <span>${cart.quantity}</span>
                        <i class="fas fa-angle-down" data-id=${cart.id}></i>
                    </div>
                    <div class="item__trash">
                        <i class="fas fa-trash-alt" data-id=${cart.id}></i>    
                    </div>
                </div>`
            cartContent.innerHTML = content;  
        });        
  };
  setupApp() {
    //   get cart from storage:
    cart = Storage.getCart() || [];
    // addCartItem to cart(modalBox):
    cart.forEach( i => this.addCartItem(i));
    
    // setValues : price + qiantity: 
    this.setCartValue(cart); 
  }
  cartLogic() {
    //  clear cart:
    clearCartBtn.addEventListener("click", () => this.clearCart());

    // cart functionality:
    cartContent.addEventListener ("click", (event) => {
        const className = event.target.classList;
        const id = event.target.dataset.id;

        if(className.contains("fa-trash-alt")){
            const removedItem = cart.find((c) => c.id == event.target.dataset.id);
            
             this.removeItem(removedItem.id);
             Storage.saveCart(cart);
             cartContent.removeChild(event.target.parentElement.parentElement)
            //  remove from cartItem
            // remove 

        } else if (className.contains("fa-angle-up")) {
            
            // 1.get item from cart by id
            const addQuantity = event.target;
            const addedItem = cart.find((cItem) => cItem.id == addQuantity.dataset.id);
            
            // 2.update cart value
            addedItem.quantity ++;
            this.setCartValue(cart);
            
            // 3.save new cart
            Storage.saveCart(cart);
            
            // 4.update cart item in UI
            addQuantity.nextElementSibling.innerText = addedItem.quantity;

        } else if (className.contains("fa-angle-down")){
             // 1.get item from cart by id
             const subQuantity = event.target;
             const substractedItem = cart.find((cItem) => cItem.id == subQuantity.dataset.id);
             
             // 2.update cart value
             if(substractedItem.quantity === 1) {
                 this.removeItem(substractedItem.id);
                 cartContent.removeChild(subQuantity.parentElement.parentElement)
             }
             substractedItem.quantity--;

             this.setCartValue(cart);
             
             // 3.save new cart
             Storage.saveCart(cart);
             
             // 4.update cart item in UI
             subQuantity.previousElementSibling.innerText = substractedItem.quantity;
        } else {
            console.log("ok")
        }

    })
  }

  clearCart() {
        // remove :
        cart.forEach((cItem) => {this.removeItem(cItem.id)});
        // remove cart content children:
        while (cartContent.children.length) {
            cartContent.removeChild(cartContent.children[0]);
            closeModal();
        }
  };

  removeItem(id) {
    // update cart:
    cart = cart.filter((cItem) => cItem.id !== id);
    // total price and cart Items: 
    this.setCartValue(cart); 
    // update storage: 
    Storage.saveCart(cart);
    // get add to cart btns => update and disabled
    this.getSinglebutton(id);
};
  getSinglebutton(id) {
        const button = buttonsDom.find ((btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerText = "add to cart";
        button.disabled = false;
   }
}

// 3.storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find(p => p.id === parseInt(id));
    }
    
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static saveQuantity(quantity) {
        localStorage.setItem("quantity" , JSON.stringify(quantity))
    }
    static getCart() {
        return JSON.parse(localStorage.getItem("cart")); 
    }
    static saveModal(cart) {
        localStorage.setItem("modal", JSON.stringify())
    }

}

document.addEventListener("DOMContentLoaded", ()=> {
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI();
    // set up: get cart and set up app :
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);
    


});
    