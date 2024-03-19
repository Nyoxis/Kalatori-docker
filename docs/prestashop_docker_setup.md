# Prestashop-kalatori docker setup

1. In prestashop directory run docker compose script
```
docker compose up
```

2. Login into prestashop admin page, default login and password:
```
demo@prestashop.com
prestashop_demo
```

3. Turn payment method for all countries. Go to **Payment** -> **Preferences**, find **Country restrictions** and select **Dot payment** to select for all countries, then **Save**

4. Find and copy real ip address of kalatori daemon by
```
docker inspect kalatori-daemon
```
In `"Network"` -> `"Network settings"` -> `"IPAddress"`

5. Go to **Payment** -> **Payment Methods** -> **Dot Payment** -> **Configure** and paste ip address instead of *localhost*, then **Save**