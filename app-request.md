# URL аппки
```
https://wv.fs5k.com/
    catalog/?
        bot_key=c7736d90-a435-4f22-920a-1f5d9ce77fb3
        on_success_node=48955
        primary_color=0d92d2
        ecommerce_url=https://fasttrack-ecom-fashion.flex.fstrk.io
        ecommerce=8f23fa09-c277-424a-9604-f5dd1c859bea
        on_close_url=https%3A//refer.id/%3Fbot%3Ddemo_webview_bot%26platform%3Dtelegram%26verbose_name%3D%D0%91%D0%BE%D1%82%20%D0%B4%D0%BB%D1%8F%20%D1%81%D0%BE%D0%B1%D0%B5%D1%81%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B9%26is_close_url%3D1
        base_url=https%3A//designer.fstrk.io/
        chat_uuid=041cc6b6-55c2-485c-be7d-58ab3ef5c0e6#/cart
```

# API-запросы аппки
1. ХЗ что, но там приходит UUID чата `https://designer.fstrk.io/api/current-bot/`
2. Тут походу запрос того, что это за магазин `https://fasttrack-ecom-fashion.flex.fstrk.io/api/ecommerce/{ecommerce}/`
3. Запрос корзины `https://designer.fstrk.io/api/partners/chats/{chat_uuid}/variables/`