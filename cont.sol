// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

contract ShopManager {

    //Структура ролей в системе
    enum Role {
        BUYER,
        SELLER,
        SHOP,
        OWNER
    }

    //Структура магазина в системе
    struct Shop {
        string name;
        address owner;
        uint256 allowedToCapture;
        bool exists;
    }

    // маппинг (название магазина => информация о продуктах в магазине)
    mapping(string => ShopProductList) shopProducts;
    
    // структура ShopProductList (список продуктов в магазине, их цена и количество):
    //    string shop - название магазина
    //    products (id товара => информация о нём) - продукты в этом магазине и информация о них (цена, количество) по ID товара
    struct ShopProductList {
        string shop;
        mapping(uint256 => ShopProduct) products;
    }

    // структура ShopProduct - информация о товаре в конкретном магазине
    struct ShopProduct {
        uint256 id;
        uint256 price;
        uint256 amount;
        bool exists;
    }

    //Структура пользователей в системе
    struct User {
        string username;
        string shop;
        bytes32 passwordHash;
        bytes32 secretHash;
        Role maxRole;
        Role currentRole;
        bool exists;
    }

    // маппинг (адрес пользователя => продукты которые он купил в разных магазинах)
    mapping(address => UserProducts) userProducts;

    // структура UserProducts
    //    address user - адрес пользователя
    //    shops - mapping(название магазина => информация о купленных продуктах)
    struct UserProducts {
        address user;
        mapping(string => UserShopProducts) shops;
    }

    // структура UserShopProducts (информация о купленных продуктах)
    //    string shop - название магазина
    //    products - mapping(id товара => информация о купленном продукте)
    struct UserShopProducts {
        string shop;
        mapping(uint256 => UserOwnedProduct) products;
    }

    // структура UserOwnedProduct (информация о купленном пользователем продукте)
    struct UserOwnedProduct {
        uint256 id;
        uint256 amount;
    }

    //Структура заявки на повышение роли
    struct ElevateRequest {
        address sender;
        Role role;
        string shop;
        bool exists;
    }

    //Структура товара
    struct Product {
        uint256 id;
        string title;
        string description;
    }

    //Структура заявки на покупку продукта
    struct BuyRequest {
        address author;
        uint256 productId;
        uint256 amount;
        string shop;
        bool accepted;
        bool reviewed;
        bool exists;
    }

    //Структура для возврата продукта
    struct RefundRequest {
        uint256 id;
        uint256 buyRequestId;
        address author;
        bool reviewed;
        bool accepted;
        bool exists;
    }
    mapping(uint256 => RefundRequest) refundRequests;
    uint256[] refundRequestIds;

    mapping(uint256 => BuyRequest) BuyRequests;
    uint256[] buyRequestIds;

    // Маппинг и массив для работы со всеми структурами ПОЛЬЗОВАТЕЛЕЙ
    mapping(address => User) users;
    mapping(string => address) userLogins;
    string[] userLoginsArray;

    // Запросы на смену роли по пользователям
    mapping(address => ElevateRequest) elevReqs;
    address[] elevReqsArray;

    //Товары по магазинам
    mapping(uint256 => Product) products;
    uint256[] productIds;

    // Магазины
    mapping(string => Shop) shops;
    mapping(address => string) shopNamesByAddress;
    string[] shopCities;

    //Модификатор для работы функции, которую может запустить только владелец системы OWNER
    modifier onlyOwner() {
        require(users[msg.sender].currentRole == Role.OWNER, "Only can do it Owner!");
        _;
    }

    //Модификатор для работы функции, которую может запустить только продавец SELLER
    modifier onlySeller() {
        require(users[msg.sender].currentRole == Role.SELLER, "Only can do it Seller!");
        _;
    }

    modifier onlyShopSeller(string memory shopCity) {
        require(keccak256(abi.encodePacked(users[msg.sender].shop)) == keccak256(abi.encodePacked(shopCity)), "You have to be a seller in required shop");
        _;
    }

    modifier onlyShopOwner() {
        require(users[msg.sender].currentRole == Role.SHOP);
        _;
    }

    //Модификатор для работы функции, которую может запустить только продавец BUYER
    modifier onlyBuyer() {
        require(users[msg.sender].currentRole == Role.BUYER, "Only can do it Buyer!");
        _;
    }

    //Модификатор для работы функции, котоую может вызвать только покупатель и продавец BUYER и SELLER
    modifier onlySellerAndBuyer() {
        require(users[msg.sender].currentRole == Role.SELLER && users[msg.sender].currentRole == Role.BUYER, "Only can do it Seller and Buyer!");
        _;
    }

    //Функция создания нового пользователя (по умолчанию покупатель)
    function createUser(
        address addr,
        string memory username,
        string memory passwordHash,
        string memory secretHash
    ) public {
        require(!users[addr].exists && !users[userLogins[username]].exists, "User already exist");

        userLoginsArray.push(username);
        userLogins[username] = addr;
        users[addr] = User(
            username,
            "",
            keccak256(abi.encodePacked(passwordHash)),
            keccak256(abi.encodePacked(secretHash)),
            Role.BUYER,
            Role.BUYER,
            true
        );
    }

    //Функцкия авторизации пользователя в системе 
    function authorizateUser(
        string memory username,
        string memory password,
        string memory secret
    ) public view returns (bool success) {
        User memory user = users[userLogins[username]];

        require(user.exists, "User does not exist");
        require(
            //encodePacked(password)) == user.passwordHash
            keccak256(abi.encodePacked(password)) == user.passwordHash && keccak256(abi.encodePacked(secret)) == user.secretHash,
            "Wrong password or secret"
        );

        return true;
    }

    //Функция запроса на смену роли
    function newElevateRequest(Role requiredRole, string memory requiredShop) public returns(bool) {
        require(!elevReqs[msg.sender].exists, "You have already sent an elevate request!");

        elevReqs[msg.sender] = ElevateRequest(
            msg.sender,
            requiredRole,
            requiredShop,
            true
        );
        elevReqsArray.push(msg.sender);

        return true;
    }

    //Вывод запросов на смену роли 
    function getElevateRequest(address sender) public view onlyOwner returns ( bool exists, Role requiredRole, string memory requiredShop) {
        return (
            elevReqs[sender].exists,
            elevReqs[sender].role,
            elevReqs[sender].shop
        );
    }

    // Функция отмены запроса на смену роли
    function cancelElevationRequest() public onlySellerAndBuyer {
        require(
            elevReqs[msg.sender].exists,
            "You have not sent any elevate requests!"
        );

        elevReqs[msg.sender].exists = false;
        for (uint256 i = 0; i < elevReqsArray.length; i++) {
            if (elevReqsArray[i] == msg.sender) {
                delete elevReqsArray[i];
            }
        }
    }

    // Подтвердить запрос на смену роли
    function approveElevationRequest(address requestAuthor, bool accept) public onlyOwner {
        ElevateRequest memory elevReq = elevReqs[requestAuthor];

        elevReqs[requestAuthor].exists = false;
        if(!accept) return;

        for(uint i = 0; i < elevReqsArray.length; i+=1) {
            if(elevReqsArray[i] == requestAuthor) {
                delete elevReqsArray[i];
                break;
            }
        }

        this.changeRole(requestAuthor, elevReq.role, elevReq.shop, true);
    }

    function getElevateRequests()
        public
        view
        onlyOwner
        returns (address[] memory requesters)
    {
        return elevReqsArray;
    }

    // Сменить роль пользователя
    function changeRole(
        address user,
        Role requiredRole,
        string memory requiredShop,
        bool maxRole
    ) public {
        users[user].currentRole = requiredRole;
        if (maxRole && users[msg.sender].currentRole == Role.OWNER) {
            users[user].currentRole = requiredRole;
            users[user].maxRole = requiredRole;
            users[user].shop = requiredShop;
        }
    }

    //Функция ввода нового администратора(только для администратора)
    function createNewOwner(
        address addr,
        string memory username,
        string memory passwordHash,
        string memory secretHash
    ) public onlyOwner {
        require(!users[addr].exists && !users[userLogins[username]].exists, "User already exist");

        userLoginsArray.push(username);
        userLogins[username] = addr;
        users[addr] = User(
            username,
            "",
            keccak256(abi.encodePacked(passwordHash)),
            keccak256(abi.encodePacked(secretHash)),
            Role.OWNER,
            Role.OWNER,
            true
        );
    }

    // Получить список магазинов
    function getShops() public view returns (string[] memory shopCitites) {
        return shopCities;
    }

    // функция создания товара, который потом продавцы смогут добавлять в свой магазин
    function createProduct(string memory title, string memory description) public onlyOwner {
        products[productIds.length] = Product(productIds.length, title, description);
        productIds.push(productIds.length);
    }

    //Функция добавления товара для магазина
    function createProductForShop(
        uint256 productId,
        uint256 amount,
        uint256 price
    ) public onlySeller returns(bool) {
        shopProducts[users[msg.sender].shop].products[productId] = ShopProduct(
            productId, price, amount, true
        );

        return true;
    }

    //Функция создания заявки на покупку товара в магазине
    function buyProduct(string memory shop, uint256 productId, uint256 amount) public payable onlyBuyer returns(bool) {
        BuyRequests[buyRequestIds.length] = BuyRequest(
            msg.sender,
            productId,
            amount,
            shop,
            false,
            false,
            true 
        );

        ShopProduct memory product = shopProducts[shop].products[productId];
        require(product.exists, "This shop does not have this product");

        uint256 amountToPay = amount * product.price;
        require(msg.value == amountToPay, "You need to send exact amount of ether that is required to buy product");

        require(shopProducts[shop].products[productId].amount >= amount, "This shop does not have this item");
        shopProducts[shop].products[productId].amount -= amount;

        return true;
    }

    //Функция, которая возвращает информацию о товаре 
    function allInfoProduct(uint256 productId) public view returns(uint256 id, string memory title, string memory description) {
        return (productId, products[productId].title, products[productId].description);
    }

    //Функция, которая подтверждает покупку товара(подтвержает SELLER)
    function acceptedBuyProduct(uint256 requestId) public onlySeller returns(bool) {
        BuyRequests[requestId].reviewed = true;
        BuyRequests[requestId].accepted = true;
        BuyRequest memory buyRequest = BuyRequests[requestId];

        ShopProduct memory shopProduct = shopProducts[buyRequest.shop].products[buyRequest.productId];
        shops[buyRequest.shop].allowedToCapture += buyRequest.amount * shopProduct.price;
        userProducts[buyRequest.author].shops[buyRequest.shop].products[buyRequest.productId].amount += buyRequest.amount;

        return true;
    }

    //Функция, которая отменяет покупку товара(подтвержает SELLER)
    function cancelBuyProduct(uint256 requestId) public onlySeller returns(bool) {
        BuyRequests[requestId].reviewed = true;
        BuyRequest memory buyRequest = BuyRequests[requestId];

        shopProducts[buyRequest.shop].products[buyRequest.productId].amount += buyRequest.amount;

        return true;
    }

    //Функция, которая отменяет покупку товара(отменяет BUYER)
    function cancelRequestBuyProduct(uint256 requestId) public onlyBuyer returns(bool) {
        BuyRequests[requestId].exists = false;
        BuyRequest memory buyRequest = BuyRequests[requestId];

        shopProducts[buyRequest.shop].products[buyRequest.productId].amount += buyRequest.amount;

        return true;
    }

    // создание заявкки на возврат товара 
    function createRefundRequest(uint256 buyRequestId) public onlyBuyer returns(bool) {
        BuyRequest memory buyRequest = BuyRequests[buyRequestId];
        require(buyRequest.author == msg.sender, "You are not permitted to do this");

        uint256 price = shopProducts[buyRequest.shop].products[buyRequest.productId].price;
        require(shops[buyRequest.shop].allowedToCapture >= buyRequest.amount * price, "Shop does not have enough ether for you to refund");
        shops[buyRequest.shop].allowedToCapture -= buyRequest.amount * price;

        refundRequests[refundRequestIds.length] = RefundRequest(refundRequestIds.length, buyRequestId, msg.sender, false, false, true);
        refundRequestIds.push(refundRequestIds.length);

        return true;
    }

    function test() public view returns(uint256, uint256) {
        uint256 amount = 5;
        uint256 price = shopProducts["Moscow"].products[0].price * amount;
        return (shops["Moscow"].allowedToCapture, price);
    }

    // подтверждение заявки на возврат 
    function acceptRefundRequest(uint256 refundRequestId) public onlySeller returns(bool) {
        refundRequests[refundRequestId].accepted = true;
        refundRequests[refundRequestId].reviewed = true;

        BuyRequest memory buyRequest = BuyRequests[refundRequests[refundRequestId].buyRequestId];
        uint256 price = shopProducts[buyRequest.shop].products[buyRequest.productId].price;
        payable(refundRequests[refundRequestId].author).transfer(buyRequest.amount * price);

        return true;
    }

    // отклонение заявки на возврат 
    function denyRefundRequest(uint256 refundRequestId) public onlySeller returns(bool) {
        refundRequests[refundRequestId].reviewed = true;
        
        BuyRequest memory buyRequest = BuyRequests[refundRequests[refundRequestId].buyRequestId];

        uint256 price = shopProducts[buyRequest.shop].products[buyRequest.productId].price;
        shops[buyRequest.shop].allowedToCapture += buyRequest.amount * price;
        return true;
    }

    // отменить запрос на возврат от имени покупателя
    function cancelRefundRequest(uint256 refundRequestId) public onlyBuyer {
        refundRequests[refundRequestId].exists = false;

        BuyRequest memory buyRequest = BuyRequests[refundRequests[refundRequestId].buyRequestId];
        uint256 price = shopProducts[buyRequest.shop].products[buyRequest.productId].price;
        shops[buyRequest.shop].allowedToCapture += buyRequest.amount * price;
    }

    // получение денег магазина с резервного счета 
    function capture(uint256 amount) public onlyShopOwner {
        require(shops[shopNamesByAddress[msg.sender]].allowedToCapture >= amount, "You can't capture more than its allowed for you to capture");

        shops[shopNamesByAddress[msg.sender]].allowedToCapture -= amount;
        payable(msg.sender).transfer(amount);
    }

    //Функция берет адрес пользователя
    function getUserAddress(string memory username) public view returns (address) {
        return userLogins[username];
    }

    function getUser(address addr)
        public
        view
        returns (
            string memory username,
            string memory shop,
            Role maxRole,
            Role currentRole,
            bool exists
        )
    {
        User memory user = users[addr];
        return (user.username, user.shop, user.maxRole, user.currentRole, user.exists);
    }

    function getUserLogins() public view returns (string[] memory usernames) {
        return userLoginsArray;
    }

    constructor() {
        users[0xF0a23C680F1097dbdBb02822a1f46E6192bD58B4] = User (
            "Owner",
            "",
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            Role.OWNER,
            Role.OWNER,
            true
        );
        userLogins["Owner"] = 0xF0a23C680F1097dbdBb02822a1f46E6192bD58B4;
        userLoginsArray.push("Owner");

        users[0xa104B2C0f5213e3Ff4C9c7DdD92BF45Eb8B0aFE2] = User (
            "Seller",
            "Moscow",
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            Role.SELLER,
            Role.OWNER,
            true
        );
        userLogins["Seller"] = 0xa104B2C0f5213e3Ff4C9c7DdD92BF45Eb8B0aFE2;
        userLoginsArray.push("Seller");

        users[0x3c2ca1390416aa6032184B5da4A6e642C9106bb4] = User (
            "Buyer",
            "",
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107,
            Role.BUYER,
            Role.OWNER,
            true
        );
        userLogins["Buyer"] = 0x3c2ca1390416aa6032184B5da4A6e642C9106bb4;
        userLoginsArray.push("Buyer");

        shops["Moscow"] = Shop (
            "Moscow",
            0xb1BeAE7433c306BF5c245E289d183F1Aa8f38462,
            0,
            true
        );
        shopNamesByAddress[0xb1BeAE7433c306BF5c245E289d183F1Aa8f38462];
        shopCities.push("Moscow");

        shops["SPb"] = Shop (
            "SPb",
            0xBcD002199A1586d107994d2A9Ed40f1bE007fc5a,
            0,
            true
        );
        shopNamesByAddress[0xBcD002199A1586d107994d2A9Ed40f1bE007fc5a];
        shopCities.push("SPb");

        shops["Tgn"] = Shop (
            "Tgn",
            0xbe503C3380dCdeb44fe1d2DB9a5C3692583FE340,
            0,
            true
        );
        shopNamesByAddress[0xbe503C3380dCdeb44fe1d2DB9a5C3692583FE340];
        shopCities.push("Tgn");

        shops["Magadan"] = Shop (
            "Magadan",
            0xf4cFE1A0B45AEb12e5c0a05e8f1d3BE0431200eD,
            0,
            true
        );
        shopNamesByAddress[0xf4cFE1A0B45AEb12e5c0a05e8f1d3BE0431200eD];
        shopCities.push("Magadan");
    }

}



geth account new --datadir "C:\geth"
geth --datadir "C:\geth" init "C:\geth\genesis.json"
geth --http --http.addr "127.0.0.1" --http.api "eth,miner,net,web3,admin,personal" --networkid 15 --datadir "C:\geth" --allow-insecure-unlock --http.corsdomain "*" console
eth.accounts()
geth attach "http://127.0.0.1:8545/"
miner.start(1)
personal.unlockAccount(eth.accounts[0])
