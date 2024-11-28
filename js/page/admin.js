const chartTitle = document.querySelector(".chart-title");
const chartArea = document.querySelector(".chart-area");
const orderPageTable = document.querySelector('.orderPage-table');
const orderPageTbody = orderPageTable.querySelector('tbody');

let orderData = [];

function init() {
    //  進入網頁馬上要看到的內容
    getOrders();
};

init();
function getOrders() {
    axios
        .get(`${adminApi}/orders`, headers)
        .then(response => {
            orderData = response.data.orders;
            renderOrder(orderData);
            clacProcuTitle();
        }).catch(error => {
            console.log(error)
        })
};

function renderOrder(data) {
    if (data.length < 1) {
        chartArea.classList.add('d-none')
        orderPageTbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <h4>目前尚無訂單</h4>
                </td>
            </tr>`
        return;
    } else {
        chartArea.classList.remove('d-none')
    };
    data.sort((a, b) => b.createdAt - a.createdAt);
    orderPageTbody.innerHTML = data.map(item => {
        let productStr = item.products.map(product => `${product.title}x${product.quantity}`).join('、');
        return `
        <tr data-id="${item.id}">
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            
            <td>${item.user.address}</td>
            <td> ${item.user.email} </td>

            <td>
                <p>${productStr}</p>
            </td>
            <td>${formatTime(item.createdAt)}</td>
            <td class="orderStatus">
                <a href="#" class="${item.paid ? 'completed' : ''}">${item.paid ? '已處理' : '未處理'}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除">
            </td>
        </tr> `
    }).join(' ');
};

// 時間格式化
function formatTime(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.toLocaleString('zh-TW', {
        hour12: false //是否要24小時制
    });
};




// 監聽整張訂單表單： 
orderPageTable.addEventListener("click", event => {
    // 刪除單一訂單
    let id = event.target.closest('tr').dataset.id;
    if (event.target.classList.contains('delSingleOrder-Btn')) {
        removerOrder(id);
    };

    // const statusBtn = event.target.closest('.orderStatus').querySelector('a');
    if (event.target.closest('.orderStatus')) {
        event.preventDefault();
        updateOrderStatus(id);
    }
});



// 修改訂單狀態
function updateOrderStatus(id) {
    // find：適合需要找到第一個符合條件的物件時。
    // filter：適合需要篩選出多個符合條件的物件並返回陣列時。
    const result = orderData.find(item => item.id === id);
    let data = {
        "data": {
            "id": id,
            "paid": !result.paid // 加入反算運算子，把true->false
        }
    };

    Swal.fire({
        title: "你確定更新訂單狀態?",
        text: `目前訂單狀態是${!data.data.paid ? '已處理' : '未處理'}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定",
        cancelButtonText: "取消"
    }).then((result) => {
        if (result.isConfirmed) {
            axios
                .put(`${adminApi}/orders`, data, headers)
                .then(response => {
                    orderData = response.data.orders;
                    renderOrder(orderData);
                })
                .catch(error => {
                    console.log(error.response.data.message)
                })
            Swal.fire({
                title: "更新完成",
                text: `訂單編號${data.data.id}，更新訂單狀態：${data.data.paid ? '已處理' : '未處理'}`,
                icon: "success"
            });
        }
    });
};


// 刪除單一訂單
function removerOrder(id) {
    Swal.fire({
        title: "你確定要刪除訂單?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是！刪除訂單!"
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${adminApi}/orders/${id}`, headers)
                .then(response => {
                    orderData = response.data.orders;
                    renderOrder(orderData);
                })
                .catch(error => { console.log(error.response.data.message) })
            Swal.fire({
                title: "訂單已刪除!",
                icon: "success"
            });
        }
    });
};


// 刪除全部商品
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", removerOrderAll)

function removerOrderAll() {
    if(orderData<1){
        Swal.fire("目前訂單列表沒有任何東西 RRR ((((；゜Д゜)))");
        return;
    }
    Swal.fire({
        title: "你確定要刪除全部訂單?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是！刪除訂單!"
    }).then((result) => {
        if (result.isConfirmed) {
            adminInstance
                .delete("orders")
                .then(response => {
                    console.log(response.data.message)
                    orderData = response.data.orders;
                    renderOrder(orderData);
                })
                .catch(error => { console.log(error.response.data.message) })
            Swal.fire({
                title: "訂單已清空!",
                icon: "success"
            });
        }
    });

}

// - [x]  LV1 圓餅圖 - 全產品類別營收比重，類別含三項，共有：床架、收納、窗簾
function clacProductCategory() {
    chartTitle.textContent = '產品類別營收比重';
    const categoryObj = {}
    orderData.forEach(item => {
        item.products.forEach(item => {
            if (!categoryObj[item.category]) {
                categoryObj[item.category] = item.price * item.quantity;
            } else {
                categoryObj[item.category] += item.price * item.quantity;
            }
        })
    });
    renderChart(Object.entries(categoryObj))
};
// - [x]  LV2 圓餅圖 - 全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為
function clacProcuTitle() {
    chartTitle.textContent = '全品項營收比重';
    const titleObj = {};
    orderData.forEach(item => {
        item.products.forEach(item => {
            if (!titleObj[item.title]) {
                titleObj[item.title] = item.quantity * item.price
            } else {
                titleObj[item.title] += item.quantity * item.price
            }
        })
    });

    // 資料做金額排序
    const sortResultArr = Object.entries(titleObj).sort((a, b) => b[1] - a[1]);
    // 篩選出前三名營收品項 -> 重新組資料
    const topThreeRanks = [];
    let otherToral = 0;
    sortResultArr.forEach((item, index) => {
        if (index <= 2) {
            topThreeRanks.push(item)
        }
        if (index > 2) {
            otherToral += item[1]
        }
    });
    if (sortResultArr.length > 2) {
        topThreeRanks.push(['其他', otherToral])
    };

    renderChart(topThreeRanks);
};

function renderChart(data) {
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: data,
        },
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
        }
    });
}


const chartToggleControl = document.querySelector('#chartToggleControl');
chartToggleControl.addEventListener("click", event => {
    if (!event.target.classList.contains('btn')) return;
    console.log();
    chartToggleControl.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const type = event.target.dataset.type
    if (type === "product-category") clacProductCategory();
    if (type === "product-title") clacProcuTitle();
});