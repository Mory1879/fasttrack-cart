import React from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Avatar, Badge, Button, Grid, IconButton, Modal, Paper, Toolbar, Typography } from '@material-ui/core';
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
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
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
  modalStyle: {
    top: "50%",
    left: "50%"
  },
  paperModal: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const ButtonsContainer = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: space-around;
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

function App() {
  const classes = useStyles();
  const [cart, setCart] = React.useState<Cart | undefined>(undefined);
  const [params, setParams] = React.useState<any>(undefined);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openClear, setOpenClear] = React.useState(false);
  // можно сделать через айдишник товара вместо индекса
  const [indexToDelete, setIndexToDelete] = React.useState<number|null>(null);

  const products: ICartItem[] = cart ? cart[Object.keys(cart)[0]].products : [];
  const totalSum = products.reduce((acc, elem) => {
    return acc + elem.price * elem.quantity;
  }, 0);

  React.useEffect(() => {
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
      "bot-key": getParams.bot_key
    } : undefined;

    setParams(getParams)

    const fetchData = async () => {
      // Не нашел применения
      // const uuid = await fetch('https://designer.fstrk.io/api/current-bot/',{
      //   headers: headers,
      // })
      //   .then((response) => response.json())
      //   .then((data) => {
      //     return data.uuid;
      //   });
      // const shop = await fetch(`https://fasttrack-ecom-fashion.flex.fstrk.io/api/ecommerce/${getParams.ecommerce}/`)
      //   .then((response) => response.json())
      //   .then((data) => data);
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
    const headers = params.bot_key ? {
      "bot-key": params.bot_key,
      'Content-Type': 'application/json'
    } : undefined;

    const updatedCart = await fetch(`https://designer.fstrk.io/api/partners/chats/${params.chat_uuid}/variables/`, {
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
    const headers = params.bot_key ? {
      "bot-key": params.bot_key,
      'Content-Type': 'application/json'
    } : undefined;

    const data = {
      node: params.on_success_node,
      is_async: false,
      get_params: params
    };

    const updatedCart = await fetch(`https://designer.fstrk.io/api/partners/chats/${params.chat_uuid}/push/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => data);
    if (updatedCart.status === 'ok') window.location.replace(params.on_close_url);
  };

  const onChangeQuantity = (index: number, addItem: boolean) => {
    const newProducts = [...products];
    if (addItem) {
      newProducts[index].quantity += 1;
    } else {
      newProducts[index].quantity -= 1;
    }
    const newCart: Cart = {...cart};
    newCart[Object.keys(newCart)[0]].products = newProducts;

    updateCart(newCart);
  };

  const deleteItem = () => {
    const newProducts = [...products].filter((product,i) => i !== indexToDelete);
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

  const handleOpen = (i: number) => {
    setIndexToDelete(i);
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
              window.location.replace(params.on_close_url);
            }}>Закрыть</Button>
          </Toolbar>
        </AppBar>
      </header>
      <Paper variant="elevation">
        <Grid container justify="space-between">
          <Typography variant="h4" gutterBottom className={classes.subtitle}>
              Корзина {cart?.length}
            </Typography>
            <Typography variant="h4" gutterBottom className={classes.subtitle}>
              {totalSum} руб.
            </Typography>
        </Grid>
        <Grid container spacing={3}>
          {products.map((product, i) => {
            return (
              <Grid key={i} item xs={12}>
                <Paper className={classes.paper}>
                  <Grid container justify="space-between">
                    <Grid item xs={1}>
                      <Avatar variant="square" src={product.image} className={classes.image} />
                    </Grid>
                    <Grid item xs={7} alignContent="flex-start">
                      <Typography color="primary" variant="body1" className={classes.itemTitle}>
                        {product.title}
                      </Typography>
                      <Typography variant="body1" className={classes.itemSize}>
                        {product.choices.field_multichoice.title}: {product.choices.field_multichoice.value}
                      </Typography>
                      <Grid container xs={12} justify="flex-start">
                        <Typography variant="body1" component="span">{product.discount_price ? (product.discount_price + " руб.") : null}</Typography>
                        <Typography variant="body1" component="span" className={product.discount_price ? classes.hasDiscountPrice : undefined}>{product.price} руб.</Typography>
                      </Grid>
                    </Grid>
                    <Grid container xs={3} justify="center" alignItems="center">
                      {
                        product.quantity == 1 ? (
                          <Button variant="contained" color="primary" onClick={() => {handleOpen(i)}}>
                            <DeleteIcon />
                          </Button>
                        ) : (
                          <Button variant="contained" color="primary" onClick={() => {onChangeQuantity(i, false)}}>-</Button>
                        )
                      }
                      <Typography variant="h4" component="span" className={classes.quantity}>{product.quantity}</Typography>
                      <Button variant="contained" color="primary" onClick={() => {onChangeQuantity(i, true)}}>+</Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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
        <div style={{
          top: `50%`,
          left: `50%`,
          transform: `translate(-50%, -50%)`
        }} className={classes.paperModal}>
          <Typography variant="h4">Удалить продукт из списка?</Typography>
          <ButtonsContainer>
          <Button variant="contained" color="primary" onClick={handleClose}>Отменить</Button>
          <Button variant="contained" color="secondary" onClick={deleteItem}>Удалить</Button>
        </ButtonsContainer>
        </div>
      </Modal>
      <Modal
        open={openClear}
        onClose={handleClearClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={{
          top: `50%`,
          left: `50%`,
          transform: `translate(-50%, -50%)`
        }} className={classes.paperModal}>
          <Typography variant="h4">Вы действительно хотите очистить корзину?</Typography>
          <ButtonsContainer>
          <Button variant="contained" color="primary" onClick={handleClearClose}>Отменить</Button>
          <Button variant="contained" color="secondary" onClick={clearCart}>Очистить</Button>
        </ButtonsContainer>
        </div>
      </Modal>
    </div>
  );
}

export default App;
