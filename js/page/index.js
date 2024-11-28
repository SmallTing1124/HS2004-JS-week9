const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');

const shoppingCartTable = document.querySelector('.shoppingCart-table');
const shoppingCartTableTbody = document.querySelector('.shoppingCart-table-tbody');
const shoppingCartTableTfoot = document.querySelector('.shoppingCart-table-tfoot');
const finalTotal = document.querySelector('.finalTotal');
const emptyCartMsg = document.querySelector('.empty-cart-message');
const btnCountMinu = document.querySelector('.btn-count-minu');
const btnCountAdd = document.querySelector('.btn-count-add');

const formOrderInfo = document.querySelector('.orderInfo-form');
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
const sendOrderBtn = document.querySelector('.orderInfo-btn');

let productData = [];
let cartData = [];

// 初始化
function init() {
    getProductData();
    getCartData();
};
init();

// api 取得產品列表
function getProductData() {
    axios.get(`${customerApi}/products`)
        .then(response => {
            productData = response.data.products;
            renderProducts(productData);
        })
        .catch(error => { console.log(error.response.data.message) });
};


// api 取得購物車列表
function getCartData() {
    axios.get(`${customerApi}/carts`)
        .then(response => {
            cartData = response.data;
            renderCarts(cartData);
        })
        .catch(error => { console.log(error.response.data.message) });
};

// 渲染 商品列表
function renderProducts(data) {
    productWrap.innerHTML = data.map(item => {
        return `
        <li class="productCard">
            <h4 class="productType">${item.category}</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCartBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>
        `
    }).join(" ");
};

// 篩選 商品類型
function filterProduct(value) {
    // let result = [];
    // if (value === "全部") {
    //     result = productData;
    // } else {
    //     result = productData.filter(item => item.category === value);
    // }
    // return result;
    return value === "全部"
        ? productData
        : productData.filter(item => item.category === value);
};
productSelect.addEventListener("change", renderFilterProduct);

// 商品列表 加入購物車 
productWrap.addEventListener("click", event => {
    event.preventDefault();
    if (event.target.classList.contains('addCartBtn')) {
        addCart(event.target.dataset.id);
    }
});

function addCart(id) {
    const addCartBtns = document.querySelectorAll('.addCartBtn');
    addCartBtns.forEach(item => {
        item.classList.add('disable')
    });
    let qty = 1;
    cartData.carts.forEach(item => {
        if (item.product.id === id) {
            qty = item.quantity + 1;
        }
    });
    let data = {
        "data": {
            "productId": id,
            "quantity": qty
        }
    };
    axios.post(`${customerApi}/carts`, data)
        .then(response => {
            cartData = response.data;
            renderCarts(cartData);
            Toast.fire({
                icon: "success",
                title: "成功加入購物車！"
            });
            addCartBtns.forEach(item => {
                item.classList.remove('disable')
            });
        })
        .catch(error => { console.log(error.response.data.message || '商品加入購物車失敗') });
};

// 選染 篩選後的 商品列表
function renderFilterProduct(event) {
    let filterData = filterProduct(event.target.value);
    renderProducts(filterData);

};


// 渲染 購物車列表
function renderCarts(data) {
    console.log(data)
    if (!data.carts.length) {
        emptyCartMsg.style.display = 'block';
        shoppingCartTable.style.display = 'none';
        return;
    } else {
        emptyCartMsg.style.display = 'none';
        shoppingCartTable.style.display = 'table';
    };
    shoppingCartTableTbody.innerHTML = data.carts.map(item => {
        return `
         <tr data-id="${item.id}">
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT${item.product.origin_price}</td>
            <td>
                <button type="buttons" class="btn btn-dark p-1 py-0 btn-count-minu">﹣</button> 
                <span class="d-inline-block px-3">${item.quantity}</span>
                <button type="button" class="btn btn-dark p-1 py-0 btn-count-add">＋</button>
            </td>
            <td>NT$${item.product.price}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons btn-delete">clear</a>
            </td>
        </tr>
        `
    }
    ).join(" ");
    finalTotal.textContent = `NT$ ${new Intl.NumberFormat('zh-TW').format(data.finalTotal)}`;
};


// 購物車列表區塊
shoppingCartTableTbody.addEventListener("click", event => {
    event.preventDefault();
    let id = event.target.closest('tr').dataset.id;
    const item = cartData.carts.find(item => item.id === id);
    // 如果商品存在，就會返回物件資料
    if (item) {
        if (event.target.classList.contains('btn-delete')) {
            deleteProduct(id);
        };
        if (event.target.classList.contains('btn-count-add')) {
            let qty = item.quantity + 1;
            updataProductCount(id, qty);
        };
        if (event.target.classList.contains('btn-count-minu')) {
            if (item.quantity === 1) {
                deleteProduct(id);
            } else {
                let qty = item.quantity - 1;
                updataProductCount(id, qty);
            }
        };
    };
});


// 更新 商品數量
function updataProductCount(id, qty) {
    let data = {
        "data": {
            "id": id,
            "quantity": qty
        }
    };
    axios.patch(`${customerApi}/carts`, data)
        .then(response => {
            cartData = response.data;
            renderCarts(cartData);
        })
        .catch(error => { console.log(error.response.data.message) })
}

// 刪除 購物車 單一商品
function deleteProduct(id) {

    axios.delete(`${customerApi}/carts/${id}`)
        .then(response => {
            cartData = response.data;
            renderCarts(cartData);
            Toast.fire({
                icon: "warning",
                title: "刪除一項商品"
            });
        })
        .catch(error => console.log(error.response.data.message));
};

// 購物車 刪除＋總額
shoppingCartTableTfoot.addEventListener("click", event => {
    event.preventDefault();
    if (event.target.classList.contains('discardAllBtn')) {
        deleteProductAll();
    };
    console.log(event.target);
});
// 清除購物車 全部產品
function deleteProductAll() {
    Swal.fire({
        icon: "warning",
        title: "確定要清空購物車?",
        showCancelButton: true,
        cancelButtonText: `取消`,

        confirmButtonText: "是，刪除全部商品",
        confirmButtonColor: "#d33"

    }).then((result) => {
        if (result.isConfirmed) {

            axios.delete(`${customerApi}/carts`)
                .then(response => {
                    cartData = response.data;
                    renderCarts(cartData);
                })
                .catch(error => console.log(error.response.data.message || '清空購物車失敗'));

            Swal.fire({
                title: "刪除!",
                text: "購物車已清空！",
                icon: "success"
            });
        }
    });

};

//送出購物車訂單
sendOrderBtn.addEventListener("click", event => {
    event.preventDefault();
    sendOrder();
});

const orderInfoMsg = document.querySelectorAll(".orderInfo-message");

function checkValue() {
    let constraints = {
        姓名: { presence: { message: "^必填" } },
        電話: { presence: { message: "^必填" } },
        Email: {
            presence: { message: "^必填" },
            email: { message: "請輸入正確的電子郵件" }
        },
        寄送地址: { presence: { message: "^必填" } },
        交易方式: { presence: { message: "^必填" } }
    };
    let errors = validate(formOrderInfo, constraints);

    // 取得所有錯誤訊息的標籤  
    orderInfoMsg.forEach(item => {
        item.textContent = '';
        if (errors) {
            item.textContent = errors[item.dataset.message]
        };
    });
    return errors;
}

//送出購買訂單
function sendOrder() {

    if (cartData.carts.length === 0) {
        Swal.fire("購物車是空的，無法送出訂單！");
        return;
    };

    if (checkValue()) {
        return;
    }

    let data = {
        "data": {
            "user": {
                "name": customerName.value.trim(),
                "tel": customerPhone.value.trim(),
                "email": customerEmail.value.trim(),
                "address": customerAddress.value.trim(),
                "payment": tradeWay.value
            }
        }
    };
    axios.post(`${customerApi}/orders`, data)
        .then(response => {
            console.log(response.data);
            Swal.fire("訂單成功送出");
            formOrderInfo.reset();
            getCartData();
        })
        .catch(error => { console.log(error.response.data.message || '送出訂單失敗') });
};