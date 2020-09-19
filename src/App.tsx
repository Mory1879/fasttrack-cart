import React from 'react';
import styled from 'styled-components';
import DocumentMeta from 'react-document-meta';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Avatar, Badge, Button, IconButton, Modal, Paper, Toolbar, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  subtitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  image: {
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
  itemTitle: {
    fontSize: 30,
    textAlign: "left"
  },
  itemSize: {
    fontSize: 25,
    fontWeight: 300,
    textAlign: "left"
  },
  hasDiscountPrice: {
    textDecoration: "line-through",
    marginLeft: theme.spacing(10)
  },
  quantity: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(5),
  },
}));

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CartItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #80808040;
`;

const ItemImage = styled(Avatar).attrs({
  variant: 'square',
})`
  margin-left: 15px;
  width: 120px;
  height: 120px;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 15px;
  justify-content: space-between;
`;

const ItemPrice = styled.div``;

const ItemQuantityContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 15px;
`;

const ButtonsContainer = styled.div`
  margin: 20px 0;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-around;
`;

const ModalContainer = styled.div`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  border: 2px solid #000;
  padding: 16px 32px 24px;
  position: absolute;
  box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12);
  background-color: #fff;
`;

interface Cart {
  [key: string]: {
    products: ICartItem[]
  }
}

interface ICartItem {
  choices: {
    choises: {
      title: string;
      value: string;
    }[];
    field_multichoice: {
      help_text: string;
      key: string;
      title: string;
      type: string;
      value: string;
    }
  };
  code: any;
  description: string;
  discount_price: number;
  field_multichoice: string[];
  guid: string;
  image: string;
  price: number;
  product_type: string;
  quantity: number;
  title: string;
}

const searchParams = new URLSearchParams(window.location.search);
const getParams = {
  bot_key: searchParams.get('bot_key'),
  on_success_node: searchParams.get('on_success_node'),
  primary_color: searchParams.get('primary_color'),
  ecommerce_url: searchParams.get('ecommerce_url'),
  ecommerce: searchParams.get('ecommerce'),
  on_close_url: searchParams.get('on_close_url'),
  base_url: searchParams.get('base_url'),
  chat_uuid: searchParams.get('chat_uuid'),
  widget_origin: searchParams.get('widget_origin'),
  is_async: searchParams.get('is_async'),
  on_clear_node: searchParams.get('on_clear_node')
};

const headers = getParams.bot_key ? {
  "bot-key": getParams.bot_key,
  'Content-Type': 'application/json'
} : undefined;

function App() {
  const classes = useStyles();
  const [cart, setCart] = React.useState<Cart | undefined>(undefined);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openClear, setOpenClear] = React.useState(false);
  const [guidToDelete, setGuidToDelete] = React.useState<string|null>(null);

  const [meta, setMeta] = React.useState<any|null>(null);

  const products: ICartItem[] = cart ? cart[Object.keys(cart)[0]].products : [];
  const totalSum = products.reduce((acc, elem) => {
    return acc + elem.price * elem.quantity;
  }, 0);

  React.useEffect(() => {
    const fetchData = async () => {
      const bot = await fetch('https://designer.fstrk.io/api/current-bot/',{
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        });

      setMeta({
        title: `${bot.name} | Корзина`,
        meta: {
          name: "viewport",
          content: "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,shrink-to-fit=no",
          charset: 'utf-8',
        }
      });


      const cart = await fetch(`https://designer.fstrk.io/api/partners/chats/${getParams.chat_uuid}/variables/`, {
        headers
      })
        .then((response) => response.json())
        .then((data) => data);
      setCart(cart);
    };

    fetchData();
  }, []);

  const updateCart = async (cart: Cart) => {
    const updatedCart = await fetch(`https://designer.fstrk.io/api/partners/chats/${getParams.chat_uuid}/variables/`, {
        method: "POST",
        headers,
        body: JSON.stringify(cart)
      })
        .then((response) => response.json())
        .then((data) => data);
    if (updatedCart.status === 'ok') setCart(cart);
    setOpenDelete(false);
  };

  const sendCart = async () => {
    const data = {
      node: getParams.on_success_node,
      is_async: false,
      get_params: getParams
    };

    const updatedCart = await fetch(`https://designer.fstrk.io/api/partners/chats/${getParams.chat_uuid}/push/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => data);
    if (updatedCart.status === 'ok' && getParams.on_close_url) window.location.replace(getParams.on_close_url);
  };

  const onChangeQuantity = (guid: string, addItem: boolean) => {
    const newProducts = [...products];
    const productIndex = newProducts.findIndex((product) => product.guid === guid);
    addItem ? 
      newProducts[productIndex].quantity += 1 :
      newProducts[productIndex].quantity -= 1;
    const newCart: Cart = {...cart};
    newCart[Object.keys(newCart)[0]].products = newProducts;

    updateCart(newCart);
  };

  const deleteItem = () => {
    const newProducts = [...products].filter((product) => product.guid !== guidToDelete);
    const newCart: Cart = {...cart};
    newCart[Object.keys(newCart)[0]].products = newProducts;

    updateCart(newCart);
  };

  const clearCart = () => {
    const newProducts: Array<ICartItem> = [];
    const newCart: Cart = {...cart};
    newCart[Object.keys(newCart)[0]].products = newProducts;
    
    updateCart(newCart);
  };

  const handleOpen = (guid: string) => {
    setGuidToDelete(guid);
    setOpenDelete(true);
  };

  const handleClearOpen = () => {
    setOpenClear(true);
  }

  const handleClose = () => {
    setOpenDelete(false);
  };

  const handleClearClose = () => {
    setOpenClear(false);
  };

  return (
    <DocumentMeta {...meta}>
      <div>
        <header>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="search">
                <SearchIcon />
              </IconButton>
              <IconButton edge="start" className={classes.title} color="inherit" aria-label="search">
                <Badge badgeContent={products.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Button color="inherit" onClick={() => {
                cart && updateCart(cart);
                if (getParams.on_close_url) window.location.replace(getParams.on_close_url);
              }}>Закрыть</Button>
            </Toolbar>
          </AppBar>
        </header>
        <Paper variant="elevation">
          <CartHeader>
            <Typography variant="h4" gutterBottom className={classes.subtitle}>
              Корзина {cart?.length}
            </Typography>
            <Typography variant="h4" gutterBottom className={classes.subtitle}>
              {totalSum} руб.
            </Typography>
          </CartHeader>
          <CartItemsContainer>
            {products.map((product, i) => {
              return (
                <CartItem key={product.guid}>
                    <ItemImage src={product.image} />
                    <ItemDetails>
                      <Typography color="primary" variant="body1" className={classes.itemTitle}>
                        {product.title}
                      </Typography>
                      <Typography variant="body1" className={classes.itemSize}>
                        {product.choices.field_multichoice.title}: {product.choices.field_multichoice.value}
                      </Typography>
                      <ItemPrice>
                        <Typography variant="body1" component="span">{product.discount_price ? (product.discount_price + " руб.") : null}</Typography>
                        <Typography variant="body1" component="span" className={product.discount_price ? classes.hasDiscountPrice : undefined}>{product.price} руб.</Typography>
                      </ItemPrice>
                    </ItemDetails>
                    <ItemQuantityContainer>
                      {
                        product.quantity == 1 ? (
                          <Button variant="contained" color="primary" onClick={() => {handleOpen(product.guid)}}>
                            <DeleteIcon />
                          </Button>
                        ) : (
                          <Button variant="contained" color="primary" onClick={() => {onChangeQuantity(product.guid, false)}}>-</Button>
                        )
                      }
                      <Typography variant="h4" component="span" className={classes.quantity}>{product.quantity}</Typography>
                      <Button variant="contained" color="primary" onClick={() => {onChangeQuantity(product.guid, true)}}>+</Button>
                    </ItemQuantityContainer>
                </CartItem>
              );
            })}
          </CartItemsContainer>
          {products.length &&(
            <ButtonsContainer>
              <Button variant="contained" color="primary" onClick={sendCart}>Оформить заказ</Button>
              <Button variant="contained" color="secondary" onClick={handleClearOpen}>Очистить корзину</Button>
            </ButtonsContainer>
          )}
        </Paper>
        <Modal
          open={openDelete}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <ModalContainer>
            <Typography variant="h4">Удалить продукт из списка?</Typography>
            <ButtonsContainer>
              <Button variant="contained" color="primary" onClick={handleClose}>Отменить</Button>
              <Button variant="contained" color="secondary" onClick={deleteItem}>Удалить</Button>
            </ButtonsContainer>
          </ModalContainer>
        </Modal>
        <Modal
          open={openClear}
          onClose={handleClearClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <ModalContainer>
            <Typography variant="h4">Вы действительно хотите очистить корзину?</Typography>
            <ButtonsContainer>
              <Button variant="contained" color="primary" onClick={handleClearClose}>Отменить</Button>
              <Button variant="contained" color="secondary" onClick={clearCart}>Очистить</Button>
            </ButtonsContainer>
          </ModalContainer>
        </Modal>
      </div>
    </DocumentMeta>
  );
}

export default App;
