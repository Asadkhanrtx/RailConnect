# RailConnect Lite (Front‑end Demo)

An educational, **front‑end only** web app inspired by popular railway booking portals. It lets you:

- Search trains between stations (using demo data)
- Mock-book a seat (stores a record in your browser LocalStorage)
- Check a **demo** PNR status
- View and delete your demo bookings

> ⚠️ **Disclaimer:** This is a demo UI. There is **no real backend**, no payments, and no live data.

## Project Structure

```
railconnect-lite-frontend/
├── index.html
├── .htaccess
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── img/
│       ├── logo.svg
│       └── hero-train.svg
└── pages/
    ├── search.html
    ├── pnr.html
    └── my-bookings.html
```

## Run Locally

Just open `index.html` in a browser or use a simple static server (recommended):

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 1) Create a Git repository & push

```bash
# In the folder that contains railconnect-lite-frontend
cd railconnect-lite-frontend

git init

git branch -M main

git add .

git commit -m "feat: initial commit for RailConnect Lite front-end demo"

# Create a new GitHub repo first (e.g., railconnect-lite-frontend), then:
# Replace <YOUR_GITHUB_USERNAME> with your handle

git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/railconnect-lite-frontend.git

git push -u origin main
```

---

## 2) Deploy on AWS EC2 (Ubuntu) with Apache

### Launch an EC2 instance
1. Choose **Ubuntu 22.04 LTS** (or 24.04).
2. Instance type: t2.micro / t3.micro (Free Tier eligible)
3. Create/download a **key pair** (\*.pem).
4. In **Security Group**, allow **Inbound HTTP (80)** from **0.0.0.0/0** and your IP for **SSH (22)**.
5. Launch the instance and note the **Public IPv4 address** or **Public DNS**.

### Connect via SSH
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Install Apache
```bash
sudo apt update && sudo apt -y install apache2

# Start and enable
sudo systemctl enable --now apache2

# (Optional) UFW firewall allow
sudo ufw allow 'Apache'
```

### Deploy the site
Option A – **Clone from GitHub** (recommended):
```bash
cd /var/www
sudo rm -rf html
sudo git clone https://github.com/<YOUR_GITHUB_USERNAME>/railconnect-lite-frontend.git html
sudo chown -R www-data:www-data /var/www/html
```

Option B – **Upload ZIP**:
```bash
# From your laptop, scp the zip
scp -i your-key.pem railconnect-lite-frontend.zip ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/

# On EC2
sudo apt -y install unzip
sudo rm -rf /var/www/html
sudo unzip /home/ubuntu/railconnect-lite-frontend.zip -d /var/www/
sudo mv /var/www/railconnect-lite-frontend /var/www/html
sudo chown -R www-data:www-data /var/www/html
```

### (Optional) Create an Apache VirtualHost
```apacheconf
# /etc/apache2/sites-available/railconnect-lite.conf
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/railconnect_error.log
    CustomLog ${APACHE_LOG_DIR}/railconnect_access.log combined
</VirtualHost>
```
Enable the site:
```bash
sudo a2dissite 000-default.conf || true
sudo a2ensite railconnect-lite.conf
sudo a2enmod rewrite headers expires
sudo systemctl reload apache2
```

### Expose the application
- Ensure your EC2 **Security Group** has an **Inbound rule** for **HTTP (80)** from **0.0.0.0/0** (and **HTTPS (443)** if you add TLS).
- Visit: `http://<EC2_PUBLIC_IP>/` or, if you set a domain, point an **A record** to the EC2 IP.
- For HTTPS, install **Certbot** and a Let’s Encrypt certificate (if you attach a domain).

```bash
# Example (if you have example.com pointed to the instance)
sudo apt -y install certbot python3-certbot-apache
sudo certbot --apache -d example.com -d www.example.com
```

## 3) Update & redeploy
When you push changes to GitHub, redeploy with:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>   'cd /var/www/html && sudo git pull && sudo chown -R www-data:www-data /var/www/html'
```

## Notes
- This is a static front-end. Any dynamic functionality uses browser storage and mock data.
- Feel free to adapt the UI, add pages, or plug into a backend later.

---

**Enjoy!**
